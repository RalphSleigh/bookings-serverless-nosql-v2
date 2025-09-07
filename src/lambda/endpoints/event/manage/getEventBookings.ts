import { subject } from '@casl/ability'

import { TBooking } from '../../../../shared/schemas/booking'
import { DB } from '../../../dynamo'
import { HandlerWrapper } from '../../../utils'

export type GetEventBookingsResponseType = { bookings: TBooking[] }

export const getEventBookings = HandlerWrapper(
  (req, res) => ['getBackend', subject('eventId', { eventId: res.locals.event.eventId })],
  async (req, res) => {
    try {
      const event = res.locals.event
      const bookings = await DB.collections.booking({ eventId: event.eventId }).go()
      if (bookings.data) {
        const bookingsWithPeople = bookings.data.booking.map((b) => {
          const people = bookings.data.person.filter((p) => p.eventId === b.eventId && !p.cancelled).sort((a, b) => a.createdAt - b.createdAt)
          return { ...b, people } as TBooking
        })
        res.json({ bookings: bookingsWithPeople })
      } else {
        res.json({ bookings: [] } as GetEventBookingsResponseType)
      }
    } catch (error) {
      res.locals.logger.logToPath('Bookings query failed')
      res.locals.logger.logToPath(error)
      throw error
    }
  },
)
