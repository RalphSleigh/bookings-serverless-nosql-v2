import { drive } from '@googleapis/drive'
import { sheets } from '@googleapis/sheets'

import { bookingFields } from '../../shared/bookingFields'
import { Current, personFields } from '../../shared/personFields'
import { BookingSchema, TBooking } from '../../shared/schemas/booking'
import { EventSchema } from '../../shared/schemas/event'
import { PersonSchema } from '../../shared/schemas/person'
import { RoleSchema } from '../../shared/schemas/role'
import { DB, DBEvent, DBRole, DBUser } from '../dynamo'
import { ConfigType } from '../getConfig'
import { getAuthClientForScope } from '../googleAuthClientHack'

export const syncDriveForEvent = async (eventId: string, config: ConfigType) => {
  console.log(`Syncing drive for event ${eventId}`)

  const eventQuery = await DBEvent.get({ eventId }).go()

  if (!eventQuery.data) {
    console.log(`Event ${eventId} not found`)
    return
  }

  const event = EventSchema.parse(eventQuery.data)

  const users = await DBUser.scan
    .where(({ preferences }, { contains }) => {
      return contains(preferences.driveSyncList, eventId)
    })
    .go({pages: "all"})

  const bookingsQuery = await DB.collections.booking({ eventId }).go()
  if (bookingsQuery.data) {
    /* const bookingsWithPeople = bookings.data.booking.map((b) => {
      const people = bookings.data.person.filter((p) => p.userId === b.userId && p.eventId === b.eventId && !p.cancelled).sort((a, b) => a.createdAt - b.createdAt)
      return { ...b, people } as TBooking
    }) */

    for (const user of users.data) {
      console.log(`Syncing drive for user ${user.name}`)
      const rolesQuery = await DBRole.find({ userId: user.userId, eventId }).go()

      if (!rolesQuery.data || rolesQuery.data.length === 0) {
        console.log(`User ${user.name} has no roles for event ${event.name}, skipping`)
        continue
      }

      const roles = RoleSchema.array().parse(rolesQuery.data)
      const filteredPersonFields = personFields(event).filter((f) => f.enabledForDrive(event) && f.available(roles))

      if (filteredPersonFields.length === 0) {
        console.log(`No fields available for user ${user.name} for event ${event.name}, skipping`)
        continue
      }

      filteredPersonFields.push(new Current(event))

      const filteredBookingFields = bookingFields(event).filter((f) => f.enabledForDrive(event) && f.available(roles))

      const people = bookingsQuery.data.person.sort((a, b) => a.createdAt - b.createdAt).map((p) => PersonSchema(event).parse(p))

      const bookings = bookingsQuery.data.booking.sort((a, b) => a.createdAt - b.createdAt).map((b) => BookingSchema(event).parse({ ...b, people: people.filter((p) => p.userId === b.userId) }))

      const camperDataForDrive = [
        filteredPersonFields.map((f) => f.titleForDrive()),
        ...people.map((p) => {
          return filteredPersonFields.map((f) => f.valueForDrive(p))
        }),
      ]

      const bookingDataForDrive = [
        filteredBookingFields.map((f) => f.titleForDrive()),
        ...bookings.map((b) => {
          return filteredBookingFields.map((f) => f.valueForDrive(b))
        }),
      ]

      const spreadsheetTitle = `Synced data for ${event.name} - ${user.name}`

      const auth = await getAuthClientForScope(config, ['https://www.googleapis.com/auth/drive.file'], user.email)
      const drive_instance = drive({ version: 'v3', auth })

      const file = await drive_instance.files.list({
        q: `name='${spreadsheetTitle}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
        fields: 'files(id, name)',
        spaces: 'drive',
      })

      let fileId: string
      if (file.data.files && file.data.files.length > 0) {
        fileId = file.data.files[0].id!
        console.log(`Found existing spreadsheet for ${user.name} (${fileId}), updating...`)
      } else {
        const file = await drive_instance.files.create({
          requestBody: {
            name: spreadsheetTitle,
            mimeType: 'application/vnd.google-apps.spreadsheet',
          },
          fields: 'id',
        })
        fileId = file.data.id!
        console.log(`Created new spreadsheet for ${user.name} (${fileId})`)
      }

      const sheets_instance = sheets({ version: 'v4', auth })

      const sheetsData = await sheets_instance.spreadsheets.get({ spreadsheetId: fileId, fields: 'sheets.properties' })

      if (!sheetsData.data.sheets?.find((s) => s.properties?.title === 'Campers')) {
        await sheets_instance.spreadsheets.batchUpdate({ spreadsheetId: fileId, requestBody: { requests: [{ addSheet: { properties: { title: 'Campers' } } }] } })
      }

      if (!sheetsData.data.sheets?.find((s) => s.properties?.title === 'Bookings')) {
        await sheets_instance.spreadsheets.batchUpdate({ spreadsheetId: fileId, requestBody: { requests: [{ addSheet: { properties: { title: 'Bookings' } } }] } })
      }

      await sheets_instance.spreadsheets.values.batchUpdate({
        spreadsheetId: fileId,
        requestBody: { valueInputOption: 'USER_ENTERED', data: [{ range: 'Campers!A1', values: camperDataForDrive }] },
      })
      await sheets_instance.spreadsheets.values.batchUpdate({
        spreadsheetId: fileId,
        requestBody: { valueInputOption: 'USER_ENTERED', data: [{ range: 'Bookings!A1', values: bookingDataForDrive }] },
      })
    }
  }
}
