import { subject } from '@casl/ability'
import { CreateEntityItem } from 'electrodb'
import { v7 as uuidv7 } from 'uuid'

import { ApplicationSchema } from '../../../shared/schemas/application'
import { BookingSchema, TBooking } from '../../../shared/schemas/booking'
import { enqueueAsyncTask } from '../../asyncTasks/asyncTaskQueuer'
import { DBApplication, DBBooking, DBBookingHistory, DBPerson, DBPersonHistory } from '../../dynamo'
import { HandlerWrapperLoggedIn } from '../../utils'

export type TCreateBookingData = {
  booking: TBooking
  min: number
  max: number
}

export const createBooking = HandlerWrapperLoggedIn(
  (req, res) => ['book', subject('event', res.locals.event)],
  async (req, res) => {
    const user = res.locals.user
    const event = res.locals.event
    const booking = req.body.booking as TBooking

    if (booking.eventId !== event.eventId) throw new Error('Event ID in path and body do not match')
    if (booking.userId !== user.userId) throw new Error('User ID in booking does not match authenticated user')

    booking.people.forEach((person) => {
      person.personId = uuidv7()
    })

    const bookingSchema = BookingSchema(event)

    const { people, ...validatedBooking } = bookingSchema.parse(booking)

    const createdBooking = await DBBooking.create(validatedBooking).go()

    if (!createdBooking.data) throw new Error('Failed to create booking')

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

    await enqueueAsyncTask({
      type: 'discordMessage',
      data: {
        message: `${createdBooking.data.basic!.name} (${createdBooking.data.basic!.district ? createdBooking.data.basic!.district : 'Individual'}) created a booking for event ${event.name}, they have booked ${booking.people.length} ${booking.people.length > 1 ? 'people' : 'person'}.`,
      },
    })

    await enqueueAsyncTask({
      type: 'emailBookingCreated',
      data: {
        eventId: event.eventId,
        userId: user.userId,
      },
    })

    await enqueueAsyncTask({
      type: 'driveSync',
      data: {
        eventId: event.eventId,
      },
    })

    const application = await DBApplication.get({ userId: res.locals.user.userId, eventId: res.locals.event.eventId }).go()

    if (application.data) {
      const newApplication = ApplicationSchema.parse({ ...application.data, minPredicted: req.body.min, maxPredicted: req.body.max })
      if (application.data.minPredicted !== newApplication.minPredicted || application.data.maxPredicted !== newApplication.maxPredicted) {
        await DBApplication.patch(application.data).set({ minPredicted: newApplication.minPredicted, maxPredicted: newApplication.maxPredicted }).go()
        await enqueueAsyncTask({
          type: 'discordMessage',
          data: {
            message: `Prediction updated from ${application.data.minPredicted} - ${application.data.maxPredicted} to ${newApplication.minPredicted} - ${newApplication.maxPredicted}`,
          },
        })
      }
    }

    res.json({ ok: 'ok' })
  },
)
