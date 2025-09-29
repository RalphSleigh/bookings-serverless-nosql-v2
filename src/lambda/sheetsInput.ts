import { drive, drive_v3 } from '@googleapis/drive'
import { auth, sheets, sheets_v4 } from '@googleapis/sheets'

import { TBasicBig } from '../shared/schemas/booking'
import { TEvent } from '../shared/schemas/event'
import { TPerson } from '../shared/schemas/person'
import { TUser } from '../shared/schemas/user'
import { ConfigType } from './getConfig'
import { getAuthClientForScope } from './googleAuthClientHack'
import { TCreateSheetForBooking } from './endpoints/booking/createSheetForBooking'

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

    const update = await sheets_instance.spreadsheets.batchUpdate({
      spreadsheetId: newSheet.data.id!,
      requestBody: {
        requests: [
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
                  values: [
                    'Name',
                    'Email',
                    'Date of Birth',
                    'Attendance',
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
                    'Medical Details',
                    'Accessbility Details',
                    'Accessbility Contact Me',
                    'First Aid',
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
                startColumnIndex: 1,
                endColumnIndex: 2,
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
                startColumnIndex: 2,
                endColumnIndex: 3,
              },
              cell: { dataValidation: { condition: { type: 'DATE_IS_VALID' } } },
              fields: 'dataValidation',
            },
          },
          /* {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 1,
                startColumnIndex: 3,
                endColumnIndex: 4,
              },
              cell: {
                dataValidation: {
                  condition: {
                    type: 'ONE_OF_LIST',
                    values: event.attendanceData?.options?.map((o) => {
                      return { userEnteredValue: o }
                    }),
                  },
                  showCustomUi: true,
                },
              },
              fields: 'dataValidation',
            },
          }, */
          /* {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 1,
                startColumnIndex: 4,
                endColumnIndex: 5,
              },
              cell: {
                dataValidation: {
                  condition: {
                    type: 'ONE_OF_LIST',
                    values: KpStructure.dietOptions.map((d) => {
                      return { userEnteredValue: d }
                    }),
                  },
                  showCustomUi: true,
                },
              },
              fields: 'dataValidation',
            },
          }, */
          {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: HEADER_ROW_INDEX + 1,
                startColumnIndex: 7,
                endColumnIndex: 16,
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
                startColumnIndex: 16,
                endColumnIndex: 18,
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
                startColumnIndex: 20,
                endColumnIndex: 22,
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
                startColumnIndex: 5,
                endColumnIndex: 16,
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
                startColumnIndex: 18,
                endColumnIndex: 22,
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
        ],
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

const getPersonFromRow = (row: NonNullable<sheets_v4.Schema$ValueRange['values']>[number], i: number, event: TEvent, userId: string): TPerson => {
  let dob: string = ''
  try {
    if (typeof row[2] !== 'number') throw 'Invalid date'
    const dateObj = ValueToDate(row[2])
    dob = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000).toISOString()
  } catch (e) {}

  const result: Partial<TPerson> = {
    personId: `sheet-${i}-${event.eventId}-${userId}`,
    eventId: event.eventId,
    userId: userId,
    basic: {
      name: row[0],
      email: row[1],
      dob: dob,
    },
    /*         attendance: {
        }, */
    kp: {
      diet: (row[4] || '').toLowerCase(),
      details: row[5],
      /*             preferences: row[6],
            nuts: row[7] === "Yes",
            gluten: row[8] === "Yes",
            soya: row[9] === "Yes",
            dairy: row[10] === "Yes" || row[4] === "vegan",
            egg: row[11] === "Yes" || row[4] === "vegan",
            pork: row[12] === "Yes" || (typeof row[4] == "string" && row[4] !== "omnivore" && row[4] !== ""),
            chickpea: row[13] === "Yes",
            diabetic: row[14] === "Yes",
            contactMe: row[15] === "Yes", */
    },
    health: {
      medical: row[18] || '',
      /*             accessibility: row[19] || "",
            contactMe: row[20] === "Yes",
            firstAid: row[21] === "Yes" */
    },
    /*         consent: {} */
  }
  /* 
    const attendance = event.attendanceData?.options?.findIndex(o => o === row[3])

    if (typeof attendance == "number" && attendance > -1) result.attendance!.option = attendance

    if (row[16]) result.consent!.photo = row[16] === "Yes"
    if (row[17]) result.consent!.sre = row[17] === "Yes"

    const removeEmpty = obj => Object.fromEntries(Object.keys(obj).filter(k => obj[k] !== '').map(k => [k, obj[k]]));

    //@ts-expect-error
    result.kp = removeEmpty(result.kp)
    //@ts-expect-error
    result.medical = removeEmpty(result.medical)
 */

  return result as TPerson
}

function ValueToDate(GoogleDateValue: number) {
  return new Date(new Date(1899, 11, 30 + Math.floor(GoogleDateValue), 0, 0, 0, 0).getTime() + (GoogleDateValue % 1) * 86400000)
}
