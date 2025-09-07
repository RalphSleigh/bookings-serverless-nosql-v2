import { subject } from '@casl/ability'
import { CreateEntityItem, EntityIdentifiers, UpdateEntityItem } from 'electrodb'

import { BookingSchema, TBooking } from '../../../shared/schemas/booking'
import { DBBooking, DBBookingHistory, DBPerson, DBPersonHistory } from '../../dynamo'
import { HandlerWrapper } from '../../utils'

export type TCreateBookingData = {
  booking: TBooking
}

export const updateBooking = HandlerWrapper(
  (req, res) => ['update', subject('eventBooking', { event: res.locals.event, booking: res.locals.booking })],
  async (req, res) => {
    const user = res.locals.user
    const event = res.locals.event
    const existingBooking = res.locals.booking
    const booking = req.body.booking as TBooking

    if (booking.eventId !== event.eventId) throw new Error('Event ID in path and body do not match')
    if (!user || booking.userId !== user.userId) throw new Error('User ID in booking does not match authenticated user')

    const bookingSchema = BookingSchema(event)

    const { people, ...validatedBooking } = bookingSchema.parse(booking)

    const { userId, eventId, createdAt, updatedAt, ...bookingUpdateData } = validatedBooking

    const updatedBooking = await DBBooking.patch(validatedBooking).set(bookingUpdateData).go({ response: 'all_new' })
    const bookingHistoryItem: EntityIdentifiers<typeof DBBookingHistory> = {
      eventId: event.eventId,
      userId: user.userId,
    }

    await DBBookingHistory.update(bookingHistoryItem)
      .append({ versions: [updatedBooking.data] })
      .go()

    const existingPeopleIds = new Set(existingBooking.people.map((p) => p.personId))
    const newPeopleIds = new Set(people.map((p) => p.personId))

    for (const person of people) {
      if (existingPeopleIds.has(person.personId)) {
        // Update existing person
        const { personId, userId, eventId, createdAt, updatedAt, ...personUpdateData } = person
        const newPerson = await DBPerson.patch(person).set(personUpdateData).go({ response: 'all_new' })
        const personHistoryItem: EntityIdentifiers<typeof DBPersonHistory> = {
          eventId: event.eventId,
          userId: user.userId,
          personId: newPerson.data.personId,
        }
        await DBPersonHistory.update(personHistoryItem)
          .append({ versions: [newPerson.data] })
          .go()
      } else {
        // Create new person
        const createdPerson = await DBPerson.create({
          ...person,
          userId: user.userId,
          eventId: event.eventId,
        }).go()
        const personHistoryItem: CreateEntityItem<typeof DBPersonHistory> = {
          eventId: event.eventId,
          userId: user.userId,
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

    /* for (const person of people) {
      const createdPerson = await DBPerson.create({
        ...person,
        userId: user.userId,
        eventId: event.eventId,
      }).go()
      const personHistoryItem: CreateEntityItem<typeof DBPersonHistory> = {
        eventId: event.eventId,
        userId: user.userId,
        personId: createdPerson.data.personId,
        versions: [createdPerson.data],
      }
      await DBPersonHistory.create(personHistoryItem).go()
    } */

    res.json({ ok: 'ok' })
  },
)
