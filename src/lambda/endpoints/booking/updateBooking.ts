import { subject } from '@casl/ability'
import { CreateEntityItem, EntityIdentifiers, UpdateEntityItem } from 'electrodb'
import { isEqual } from 'lodash-es'

import { BookingSchema, TBooking } from '../../../shared/schemas/booking'
import { enqueueAsyncTask } from '../../asyncTasks/asyncTaskQueuer'
import { DB, DBBooking, DBBookingHistory, DBPerson, DBPersonHistory } from '../../dynamo'
import { HandlerWrapper } from '../../utils'

export type TCreateBookingData = {
  booking: TBooking
}

export const updateBooking = HandlerWrapper(
  (req, res) => ['update', subject('eventBooking', { event: res.locals.event, booking: res.locals.booking })],
  async (req, res) => {
    const startTime = Date.now()
    const user = res.locals.user
    const event = res.locals.event
    const booking = req.body.booking as TBooking

    if (!user) throw new Error('No user in context')
    if (booking.eventId !== event.eventId) throw new Error('Event ID in path and body do not match')
    const own = user.userId === booking.userId

    const bookingSchema = BookingSchema(event)

    const existingBookingQuery = await DBBooking.find({ userId: booking.userId, eventId: event.eventId }).go()
    const existingPeopleQuery = await DBPerson.find({ userId: booking.userId, eventId: event.eventId }).go()

    const existingBooking = { ...existingBookingQuery.data[0], people: existingPeopleQuery.data.filter((p) => !p.cancelled) }

    const { people, ...validatedBooking } = bookingSchema.parse(booking)

    const { userId, eventId, createdAt, updatedAt, ...bookingUpdateData } = validatedBooking

    const updatedBooking = await DBBooking.patch(validatedBooking)
      .set({ ...bookingUpdateData, cancelled: false })
      .go({ response: 'all_new' })
    const bookingHistoryItem: EntityIdentifiers<typeof DBBookingHistory> = {
      eventId,
      userId,
    }

    await DBBookingHistory.update(bookingHistoryItem)
      .append({ versions: [updatedBooking.data] })
      .go()

    const existingPeopleIds = new Set(existingBooking.people.map((p) => p.personId))
    const newPeopleIds = new Set(people.map((p) => p.personId))

    for (const person of people) {
      if (existingPeopleIds.has(person.personId)) {
        const { createdAt: oldCreatedAt, updatedAt: oldUpdatedAt, ...newPersonToCompare } = existingBooking.people.find((p) => p.personId === person.personId) || {}
        const { createdAt: newCreatedAt, updatedAt: newUpdatedAt, ...newPersonDataToCompare } = person

        if (isEqual(newPersonToCompare, newPersonDataToCompare)) {
          // No changes to this person
          continue
        }

        // Update existing person
        const { personId, userId, eventId, createdAt, updatedAt, ...personUpdateData } = person
        const newPerson = await DBPerson.patch(person)
          .set({ ...personUpdateData, cancelled: false })
          .go({ response: 'all_new' })

        const personHistoryItem: EntityIdentifiers<typeof DBPersonHistory> = {
          eventId,
          userId,
          personId: newPerson.data.personId,
        }

        await DBPersonHistory.update(personHistoryItem)
          .append({ versions: [newPerson.data] })
          .go()
      } else {
        // Create new person
        const createdPerson = await DBPerson.create({
          ...person,
          userId,
          eventId,
        }).go()
        const personHistoryItem: CreateEntityItem<typeof DBPersonHistory> = {
          eventId,
          userId,
          personId: createdPerson.data.personId,
          versions: [createdPerson.data],
        }
        await DBPersonHistory.create(personHistoryItem).go()
      }

      for (const person of existingBooking.people) {
        if (!newPeopleIds.has(person.personId)) {
          const { personId, userId, eventId, createdAt, updatedAt, ...personUpdateData } = person
          const newPerson = await DBPerson.patch(person)
            .set({ ...personUpdateData, cancelled: true })
            .go({ response: 'all_new' })
          const personHistoryItem: EntityIdentifiers<typeof DBPersonHistory> = {
            eventId: event.eventId,
            userId: user.userId,
            personId: newPerson.data.personId,
          }
          await DBPersonHistory.update(personHistoryItem)
            .append({ versions: [newPerson.data] })
            .go()
        }
      }
    }

    res.locals.logger.logToPath('Enqueuing async email task')
    enqueueAsyncTask({
      type: 'emailBookingUpdated',
      data: {
        eventId: event.eventId,
        userId: user.userId,
      },
    })

    enqueueAsyncTask({
      type: 'driveSync',
      data: {
        eventId: event.eventId,
      },
    })

    res.locals.logger.logToPath(`Update booking took ${Date.now() - startTime}ms`)

    res.json({ ok: 'ok' })
  },
)
