import { subject } from '@casl/ability'
import { CreateEntityItem } from 'electrodb'

import { BookingSchema, TBooking } from '../../../shared/schemas/booking'
import { enqueueAsyncTask } from '../../asyncTasks/asyncTaskQueuer'
import { DBBooking, DBBookingHistory, DBPerson, DBPersonHistory } from '../../dynamo'
import { HandlerWrapper, HandlerWrapperLoggedIn } from '../../utils'

export type TCreateBookingData = {
  booking: TBooking
}

export const createBooking = HandlerWrapperLoggedIn(
  (req, res) => ['book', subject('event', res.locals.event)],
  async (req, res) => {
    const user = res.locals.user
    const event = res.locals.event
    const booking = req.body.booking as TBooking

    if (booking.eventId !== event.eventId) throw new Error('Event ID in path and body do not match')
    if (booking.userId !== user.userId) throw new Error('User ID in booking does not match authenticated user')

    const bookingSchema = BookingSchema(event)

    const { people, ...validatedBooking } = bookingSchema.parse(booking)

    const createdBooking = await DBBooking.create(validatedBooking).go()
    const bookingHistoryItem: CreateEntityItem<typeof DBBookingHistory> = {
      eventId: event.eventId,
      userId: user.userId,
      versions: [createdBooking.data],
    }
    await DBBookingHistory.create(bookingHistoryItem).go()

    for (const person of people) {
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

    enqueueAsyncTask({
      type: 'driveSync',
      data: {
        eventId: event.eventId,
      },
    })

    res.json({ ok: 'ok' })
  },
)
