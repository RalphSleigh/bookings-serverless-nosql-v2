import { drive, drive_v3 } from '@googleapis/drive'
import { auth, sheets, sheets_v4 } from '@googleapis/sheets'
import { request } from 'express'
import { string } from 'zod/v4'

import { getAttendanceType } from '../shared/attendance/attendance'
import { FreeChoiceAttendance } from '../shared/attendance/freechoice'
import { KPBasicOptions } from '../shared/kp/kp'
import { TEvent, TEventFreeChoiceAttendance, TEventLargeKP, TEventVCampConsents } from '../shared/schemas/event'
import { TPerson } from '../shared/schemas/person'
import { TUser } from '../shared/schemas/user'
import { TCreateSheetForBooking } from './endpoints/booking/createSheetForBooking'
import { ConfigType } from './getConfig'
import { getAuthClientForScope } from './googleAuthClientHack'

const HEADER_ROW_INDEX = 6

export const getEventHasSheet = async (config: ConfigType, event: TEvent, user: TUser) => {
  const auth = await getAuthClientForScope(config, ['https://www.googleapis.com/auth/drive.readonly'])
  const drive_instance = drive({ version: 'v3', auth })

  try {
    const rootFolder = await drive_instance.files.list({ q: `name = 'shared_sheets' and mimeType = 'application/vnd.google-apps.folder' and trashed = false` })
    if (!rootFolder.data?.files?.[0]) throw new Error('Root folder not found')

    const eventFolder = await drive_instance.files.list({
      q: `name contains '${event.eventId}' and mimeType = 'application/vnd.google-apps.folder' and '${rootFolder.data.files[0].id}' in parents and trashed = false`,
    })
    if (!eventFolder.data?.files?.[0]) throw new Error('Event folder not found')

    const userFolder = await drive_instance.files.list({
      q: `name contains '${user.userId}' and mimeType = 'application/vnd.google-apps.folder' and '${eventFolder.data.files[0].id}' in parents and trashed = false`,
    })
    if (!userFolder.data?.files?.[0]) throw new Error('Event folder not found')

    const userFile = await drive_instance.files.list({ q: `'${userFolder.data.files[0].id}' in parents and trashed = false`, fields: 'files(id, name, webViewLink)' })
    if (!userFile.data?.files?.[0]) return false
    return userFile.data.files[0]
  } catch (e) {
    return false
  }
}

const getHeadersFromEvent = (event: TEvent) => {
  const attendance = getAttendanceType(event) as FreeChoiceAttendance

  if (attendance.typeName !== 'freechoice') throw new Error('Only free choice attendance supported for sheets')
  const nights = attendance.getNightsFromEvent(event as TEvent<any, any, TEventFreeChoiceAttendance, any>)
  const nightHeaders = nights.map((night) => `${night.start.format('DD/MM')} - ${night.end.format('DD/MM')}`)

  return [
    ...['Name', 'Email', 'Date of Birth'],
    ...nightHeaders,
    ...[
      'Dietary Requirements',
      'Dietary Details',
      'Dietary Preferences',
      'Nut Free',
      'Gluten Free',
      'Soya Free',
      'Dairy Free',
      'Egg Free',
      'Pork Free',
      'Chickpea Free',
      'Diabetic',
      'Complicated Needs - Contact Me',
      'Photo Consent',
      'RSE Consent (12 - 17 only)',
      'Activities Consent',
      'Medical Details',
      'Accessibility Details',
      'Accessibility Contact Me',
      'First Aid',
    ],
  ]
}

export async function createSheetForBooking(config: ConfigType, event: TEvent, user: TUser, basic: TCreateSheetForBooking, locales: string[]) {
  if (!basic.email || !basic.name || !basic.district) throw new Error('Need basic infomation')

  const auth = await getAuthClientForScope(config, ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.readonly'])
  //const auth = await getAuthClientForScope(config, ['https://www.googleapis.com/auth/drive.file'])
  const drive_instance = drive({ version: 'v3', auth })

  try {
    const sheet = await getEventHasSheet(config, event, user)

    if (sheet) return sheet

    const rootFolder = await drive_instance.files.list({ q: `name = 'shared_sheets' and mimeType = 'application/vnd.google-apps.folder'` })
    if (!rootFolder.data?.files?.[0]) throw new Error('Root folder not found')

    let eventFolderId: string | undefined | null
    const eventFolder = await drive_instance.files.list({
      q: `name contains '${event.eventId}' and mimeType = 'application/vnd.google-apps.folder' and '${rootFolder.data.files[0].id}' in parents and trashed = false`,
    })
    if (eventFolder.data?.files?.[0]) {
      eventFolderId = eventFolder.data.files[0].id
    } else {
      const newEventFolder = await drive_instance.files.create({
        requestBody: {
          name: `${config.BASE_URL} - ${event.name} (${event.eventId})`,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [rootFolder.data.files[0].id!],
        },
        fields: 'id',
      })
      eventFolderId = newEventFolder.data.id
    }

    let userFolderId: string | undefined | null
    const userFolder = await drive_instance.files.list({
      q: `name contains '${user.userId}' and mimeType = 'application/vnd.google-apps.folder' and '${eventFolderId}' in parents and trashed = false`,
    })
    if (userFolder.data?.files?.[0]) {
      userFolderId = userFolder.data.files[0].id
    } else {
      const newUserFolder = await drive_instance.files.create({
        requestBody: {
          name: `${basic.district} - ${user.name} (${user.userId})`,
          mimeType: 'application/vnd.google-apps.folder',
          parents: [eventFolderId!],
        },
        fields: 'id',
      })
      userFolderId = newUserFolder.data.id
    }

    const newSheet = await drive_instance.files.create({
      requestBody: {
        name: `${basic.name} (${basic.district}) Campers for ${event.name}`,
        mimeType: 'application/vnd.google-apps.spreadsheet',
        parents: [userFolderId!],
      },
      fields: 'id, webViewLink',
    })

    const sheets_instance = sheets({ version: 'v4', auth: auth })

    const headerValues = getHeadersFromEvent(event)

    const index = (string: string) => {
      const result = headerValues.indexOf(string)
      if (result === -1) throw new Error(`Header not found: ${string}`)
      return result
    }

    const attendance = getAttendanceType(event) as FreeChoiceAttendance

    if (attendance.typeName !== 'freechoice') throw new Error('Only free choice attendance supported for sheets')
    const nights = attendance.getNightsFromEvent(event as TEvent<any, any, TEventFreeChoiceAttendance, any>)

    const requests = [
      {
        appendDimension: {
          sheetId: 0,
          dimension: 'COLUMNS',
          length: 5,
        },
      },
      {
        updateCells: {
          start: {
            sheetId: 0,
            rowIndex: 0,
            columnIndex: 0,
          },
          rows: [
            {
              values: ['Instructions', '', '', '', '', 'Tips & Tricks'].map((v) => {
                return { userEnteredValue: { stringValue: v } }
              }),
            },
            {
              values: ['1) Fill in details of your campers below', '', '', '', '', ' * Rows without the name column filled in will be ignored'].map((v) => {
                return { userEnteredValue: { stringValue: v } }
              }),
            },
            {
              values: [
                '2) Return to the booking form and press the "Import Campers to Form" button"',
                '',
                '',
                '',
                '',
                ' * If you mess up, you can use file -> version history to restore an earlier version of the spreadsheet',
              ].map((v) => {
                return { userEnteredValue: { stringValue: v } }
              }),
            },
            {
              values: ['3) Fix any validation errors then press "Submit Booking" at the bottom of the form', '', '', '', '', ' * The fields with a grey background are optional'].map((v) => {
                return { userEnteredValue: { stringValue: v } }
              }),
            },
            {
              values: [
                '',
                '',
                '',
                '',
                '',
                ' * If your data already exists in another google sheet, you can use the IMPORTRANGE function to import it (The checkboxes will require the values "Yes" or "No" imported) ',
              ].map((v) => {
                return { userEnteredValue: { stringValue: v } }
              }),
            },
          ],
          fields: 'userEnteredValue.stringValue',
        },
      },
      {
        repeatCell: {
          range: {
            sheetId: 0,
            startRowIndex: 0,
            startColumnIndex: 0,
            endRowIndex: 1,
          },
          cell: { userEnteredFormat: { textFormat: { bold: true } } },
          fields: 'userEnteredFormat',
        },
      },
      {
        updateCells: {
          start: {
            sheetId: 0,
            rowIndex: HEADER_ROW_INDEX,
            columnIndex: 0,
          },
          rows: [
            {
              values: headerValues.map((v) => {
                return { userEnteredValue: { stringValue: v } }
              }),
            },
          ],
          fields: 'userEnteredValue.stringValue',
        },
      },
      {
        repeatCell: {
          range: {
            sheetId: 0,
            startRowIndex: HEADER_ROW_INDEX,
            startColumnIndex: 0,
            endRowIndex: HEADER_ROW_INDEX + 1,
          },
          cell: { userEnteredFormat: { textFormat: { bold: true }, borders: { bottom: { style: 'SOLID' } } } },
          fields: 'userEnteredFormat',
        },
      },
      {
        repeatCell: {
          range: {
            sheetId: 0,
            startRowIndex: HEADER_ROW_INDEX + 1,
            startColumnIndex: index('Email'),
            endColumnIndex: index('Email') + 1,
          },
          cell: { dataValidation: { condition: { type: 'TEXT_IS_EMAIL' } } },
          fields: 'dataValidation',
        },
      },
      {
        repeatCell: {
          range: {
            sheetId: 0,
            startRowIndex: HEADER_ROW_INDEX + 1,
            startColumnIndex: index('Date of Birth'),
            endColumnIndex: index('Date of Birth') + 1,
          },
          cell: { dataValidation: { condition: { type: 'DATE_IS_VALID' } } },
          fields: 'dataValidation',
        },
      },
      {
        repeatCell: {
          range: {
            sheetId: 0,
            startRowIndex: HEADER_ROW_INDEX + 1,
            startColumnIndex: index('Date of Birth') + 1,
            endColumnIndex: index('Date of Birth') + 1 + nights.length,
          },
          cell: {
            dataValidation: { condition: { type: 'BOOLEAN', values: [{ userEnteredValue: 'Yes' }, { userEnteredValue: 'No' }] }, showCustomUi: true },
            userEnteredValue: { stringValue: 'Yes' },
          },
          fields: ['dataValidation', 'userEnteredValue.stringValue'].join(', '),
        },
      },
      {
        repeatCell: {
          range: {
            sheetId: 0,
            startRowIndex: HEADER_ROW_INDEX + 1,
            startColumnIndex: index('Dietary Requirements'),
            endColumnIndex: index('Dietary Requirements') + 1,
          },
          cell: {
            dataValidation: {
              condition: {
                type: 'ONE_OF_LIST',
                values: KPBasicOptions.map((d) => {
                  return { userEnteredValue: d }
                }),
              },
              showCustomUi: true,
            },
          },
          fields: 'dataValidation',
        },
      },
      {
        repeatCell: {
          range: {
            sheetId: 0,
            startRowIndex: HEADER_ROW_INDEX + 1,
            startColumnIndex: index('Nut Free'),
            endColumnIndex: index('Complicated Needs - Contact Me') + 1,
          },
          cell: { dataValidation: { condition: { type: 'BOOLEAN', values: [{ userEnteredValue: 'Yes' }, { userEnteredValue: 'No' }] }, showCustomUi: true } },
          fields: 'dataValidation',
        },
      },
      {
        repeatCell: {
          range: {
            sheetId: 0,
            startRowIndex: HEADER_ROW_INDEX + 1,
            startColumnIndex: index('Photo Consent'),
            endColumnIndex: index('Activities Consent') + 1,
          },
          cell: { dataValidation: { condition: { type: 'ONE_OF_LIST', values: [{ userEnteredValue: 'Yes' }, { userEnteredValue: 'No' }] }, showCustomUi: true } },
          fields: 'dataValidation',
        },
      },
      {
        repeatCell: {
          range: {
            sheetId: 0,
            startRowIndex: HEADER_ROW_INDEX + 1,
            startColumnIndex: index('Accessibility Contact Me'),
            endColumnIndex: index('First Aid') + 1,
          },
          cell: { dataValidation: { condition: { type: 'BOOLEAN', values: [{ userEnteredValue: 'Yes' }, { userEnteredValue: 'No' }] }, showCustomUi: true } },
          fields: 'dataValidation',
        },
      },
      {
        repeatCell: {
          range: {
            sheetId: 0,
            startRowIndex: HEADER_ROW_INDEX + 1,
            startColumnIndex: index('Dietary Details'),
            endColumnIndex: index('Complicated Needs - Contact Me') + 1,
          },
          cell: { userEnteredFormat: { backgroundColor: { red: 0.93, blue: 0.93, green: 0.93, alpha: 1 } } },
          fields: 'userEnteredFormat',
        },
      },
      {
        repeatCell: {
          range: {
            sheetId: 0,
            startRowIndex: HEADER_ROW_INDEX + 1,
            startColumnIndex: index('Medical Details'),
            endColumnIndex: index('First Aid') + 1,
          },
          cell: { userEnteredFormat: { backgroundColor: { red: 0.93, blue: 0.93, green: 0.93, alpha: 1 } } },
          fields: 'userEnteredFormat',
        },
      },
      /* {
            addProtectedRange: {
              protectedRange: {
                range: {
                  sheetId: 0,
                  startRowIndex: 0,
                  endRowIndex: 1,
                  startColumnIndex: 0,
                },
                description: 'Protect all except the first row',
                warningOnly: false,
                requestingUserCanEdit: false,
                editors: {
                  users: [config.GOOGLE_WORKSPACE_EMAIL],
                },
              },
            },
          }, */
    ]

    const update = await sheets_instance.spreadsheets.batchUpdate({
      spreadsheetId: newSheet.data.id!,
      requestBody: {
        requests: requests,
      },
    })

    for (let locale of locales) {
      try {
        //@ts-ignore
        await sheets_instance.spreadsheets.batchUpdate({
          spreadsheetId: newSheet.data.id!,
          requestBody: {
            requests: [
              {
                updateSpreadsheetProperties: {
                  properties: {
                    locale: locale.replaceAll('-', '_'),
                  },
                  fields: 'locale',
                },
              },
            ],
          },
        })
        break
      } catch (e) {
        console.log(e)
      }
    }

    /*     const auth_drive_file = await getAuthClientForScope(config, ['https://www.googleapis.com/auth/drive.file'])
  //const auth = await getAuthClientForScope(config, ['https://www.googleapis.com/auth/drive.file'])
    const drive_instance_auth_drive_file = drive({ version: 'v3', auth: auth_drive_file }) */

    await drive_instance.permissions.create({
      fileId: newSheet.data.id!,
      emailMessage: `You can fill in this sheet with the details of your campers for ${event.name}, once you have filled it in, return to the booking form to import the data.`,
      requestBody: {
        role: 'writer',
        type: 'user',
        emailAddress: basic.email,
      },
    })

    return newSheet.data
  } catch (e) {
    console.log(e)
    return false
  }
}

const promiseCache: { [key: string]: Promise<any> } = {}

const cachedPromise = (key: string, fn: () => Promise<any>) => {
  console.log('Cached promise', key)
  if (!promiseCache[key]) {
    console.log('Creating new promise', key)
    promiseCache[key] = fn()
  }
  console.log('Returning cached promise', key)
  return promiseCache[key]
}

export const getCampersFromSheet = async (config: ConfigType, event: TEvent, user: TUser): Promise<TPerson[]> => {
  const auth = await getAuthClientForScope(config, ['https://www.googleapis.com/auth/drive.readonly'])
  const drive_instance = drive({ version: 'v3', auth })

  let sheet: drive_v3.Schema$File

  try {
    const rootFolder = await cachedPromise('root', () => drive_instance.files.list({ q: `name = 'shared_sheets' and mimeType = 'application/vnd.google-apps.folder' and trashed = false` }))
    if (!rootFolder.data?.files?.[0]) throw new Error('Root folder not found')

    const eventFolder = await cachedPromise(event.eventId, () =>
      drive_instance.files.list({ q: `name contains '${event.eventId}' and mimeType = 'application/vnd.google-apps.folder' and '${rootFolder.data.files[0].id}' in parents and trashed = false` }),
    )
    if (!eventFolder.data?.files?.[0]) throw new Error('Event folder not found')

    const userFolder = await cachedPromise(`${event.eventId}${user.userId}`, () =>
      drive_instance.files.list({ q: `name contains '${user.userId}' and mimeType = 'application/vnd.google-apps.folder' and '${eventFolder.data.files[0].id}' in parents and trashed = false` }),
    )
    if (!userFolder.data?.files?.[0]) throw new Error('Event folder not found')

    const userFile = await cachedPromise(`${event.eventId}${user.userId}sheetfile`, () =>
      drive_instance.files.list({ q: `'${userFolder.data.files[0].id}' in parents and trashed = false`, fields: 'files(id, name, webViewLink)' }),
    )
    if (!userFile.data?.files?.[0]) throw new Error('Sheet not found')

    sheet = userFile.data.files[0]
  } catch (e) {
    throw new Error('Sheet not found')
  }

  const sheets_instance = sheets({ version: 'v4', auth: auth })

  console.log('Getting sheet data', sheet.id)
  const response = await sheets_instance.spreadsheets.values.get({
    spreadsheetId: sheet.id!,
    range: 'Sheet1',
    valueRenderOption: 'UNFORMATTED_VALUE',
  })
  console.log('Got sheet data', sheet.id)

  if (!response.data.values) throw new Error('No data found')

  const people = response.data.values
    .slice(HEADER_ROW_INDEX + 1)
    .filter((row) => row[0])
    .map((row, i) => getPersonFromRow(row, i, event, user.userId))

  console.log(people)

  return people
}

const getPersonFromRow = (
  row: NonNullable<sheets_v4.Schema$ValueRange['values']>[number],
  i: number,
  event: TEvent,
  userId: string,
): TPerson<TEvent<TEventLargeKP, TEventVCampConsents, TEventFreeChoiceAttendance>> => {
  const headerValues = getHeadersFromEvent(event)
  const index = (string: string) => {
    const result = headerValues.indexOf(string)
    if (result === -1) throw new Error(`Header not found: ${string}`)
    return result
  }

  let dob: string = ''
  try {
    if (typeof row[2] !== 'number') throw 'Invalid date'
    const dateObj = ValueToDate(row[index('Date of Birth')])
    dob = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000).toISOString().split('T')[0]
  } catch (e) {}

  const result: Partial<TPerson<TEvent<TEventLargeKP, TEventVCampConsents, TEventFreeChoiceAttendance>>> = {
    personId: `sheet-${i}-${event.eventId}-${userId}`,
    eventId: event.eventId,
    userId: userId,
    basic: {
      name: row[index('Name')],
      email: row[index('Email')],
      dob: dob,
    },
    /*         attendance: {
        }, */
    kp: {
      diet: (row[index('Dietary Requirements')] || '').toLowerCase(),
      details: row[index('Dietary Details')],
      preferences: row[index('Dietary Preferences')],
      nut: row[index('Nut Free')] === 'Yes',
      gluten: row[index('Gluten Free')] === 'Yes',
      soya: row[index('Soya Free')] === 'Yes',
      dairy: row[index('Dairy Free')] === 'Yes',
      egg: row[index('Egg Free')] === 'Yes',
      pork: row[index('Pork Free')] === 'Yes',
      chickpea: row[index('Chickpea Free')] === 'Yes',
      diabetic: row[index('Diabetic')] === 'Yes',
      contactMe: row[index('Complicated Needs - Contact Me')] === 'Yes',
    },
    health: {
      medical: row[index('Medical Details')] || '',
      accessibility: row[index('Accessibility Details')] || '',
      contactMe: row[index('Accessibility Contact Me')] === 'Yes',
    },
    firstAid: row[index('First Aid')] === 'Yes',
    consents: {
      photo: row[index('Photo Consent')],
      rse: row[index('RSE Consent (12 - 17 only)')],
      activities: row[index('Activities Consent')],
    },
  }

  const attendance = getAttendanceType(event) as FreeChoiceAttendance
  if (attendance.typeName !== 'freechoice') throw new Error('Invalid attendance type')

  const nights = attendance.getNightsFromEvent(event as TEvent<any, any, TEventFreeChoiceAttendance>)

  let bitMask = 0
  for (let nightIndex = 0; nightIndex < nights.length; nightIndex++) {
    if (row[index('Date of Birth') + 1 + nightIndex] === 'Yes') bitMask += 2 ** nightIndex
  }

  result.attendance = { bitMask }

  //const attendance = event.attendanceData?.options?.findIndex((o) => o === row[3])

  return result as TPerson<TEvent<TEventLargeKP, TEventVCampConsents, TEventFreeChoiceAttendance>>
}

function ValueToDate(GoogleDateValue: number) {
  return new Date(new Date(1899, 11, 30 + Math.floor(GoogleDateValue), 0, 0, 0, 0).getTime() + (GoogleDateValue % 1) * 86400000)
}
