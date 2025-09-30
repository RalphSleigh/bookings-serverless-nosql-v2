import { subject } from '@casl/ability'
import { CreateEntityItem, EntityIdentifiers, UpdateEntityItem } from 'electrodb'

import { BookingSchema, TBooking } from '../../../shared/schemas/booking'
import { TUser } from '../../../shared/schemas/user'
import { enqueueAsyncTask } from '../../asyncTasks/asyncTaskQueuer'
import { DB, DBBooking, DBBookingHistory, DBPerson, DBPersonHistory } from '../../dynamo'
import { HandlerWrapper } from '../../utils'

export type TCreateBookingData = {
  booking: TBooking
}

export const cancelBooking = HandlerWrapper<any, { eventId: string; userId: string }>(
  (req, res) => ['cancelBooking', subject('eventBookingIds', { eventId: res.locals.event.eventId, userId: req.params.userId })],
  async (req, res) => {
    const booking = await DBBooking.get({ eventId: res.locals.event.eventId, userId: req.params.userId }).go()
    if (!booking.data) {
      return res.status(404).json({ message: 'Booking not found' })
    }

    const updatedBooking = await DBBooking.patch(booking.data).set({ cancelled: true }).go({ response: 'all_new' })
    const bookingHistoryItem: EntityIdentifiers<typeof DBBookingHistory> = {
      eventId: res.locals.event.eventId,
      userId: req.params.userId,
    }

    await DBBookingHistory.update(bookingHistoryItem)
      .append({ versions: [updatedBooking.data] })
      .go()

    /*     const people = await DBPerson.find({ eventId: res.locals.event.eventId, userId: req.params.userId }).go() */

    /*     for (const person of people.data) {
      await DBPerson.patch(person).set({cancelled: true}).go({ response: 'all_new' })
      const personHistoryItem: EntityIdentifiers<typeof DBPersonHistory> = {
        eventId: res.locals.event.eventId,
        userId: req.params.userId,
        personId: person.personId
      }
      await DBPersonHistory.update(personHistoryItem)
        .append({ versions: [person] })
        .go()
    } */

    /*     res.locals.logger.logToPath("Enqueuing async email task")
    enqueueAsyncTask({
      type: "emailBookingUpdated",
      data: {
        eventId: event.eventId,
        userId: user.userId,
      },
    }) */

    res.json({ ok: 'ok' })
  },
)
