import { subject } from '@casl/ability'

import { TBooking } from '../../../../shared/schemas/booking'
import { TEvent } from '../../../../shared/schemas/event'
import { TPerson } from '../../../../shared/schemas/person'
import { DB } from '../../../dynamo'
import { HandlerWrapper } from '../../../utils'

export type TPersonWithoutSensitiveInfo<Event extends TEvent = TEvent> = Omit<TPerson<Event>, 'kp' | 'health'>

type TBookingWithoutSensitiveInfo<Event extends TEvent = TEvent> = Omit<TBooking, 'people'> & {
  people: TPersonWithoutSensitiveInfo<Event>[]
}

export type TBookingResponse<Event extends TEvent = TEvent> = TBooking<Event> | TBookingWithoutSensitiveInfo<Event>

export type TPersonResponse<Event extends TEvent = TEvent> = TPerson<Event> | TPersonWithoutSensitiveInfo<Event>

export type GetEventBookingsResponseType = { bookings: TBookingResponse[] }

export const getEventBookings = HandlerWrapper(
  (req, res) => ['getBackend', subject('eventId', { eventId: res.locals.event.eventId })],
  async (req, res) => {
    try {
      const permissions = res.locals.permissions
      const event = res.locals.event
      const bookings = await DB.collections.booking({ eventId: event.eventId }).go()
      if (bookings.data) {
        const bookingsWithPeople = bookings.data.booking
          .filter((b) => !b.cancelled)
          .map((b) => {
            const people = bookings.data.person.filter((p) => p.userId === b.userId && p.eventId === b.eventId && !p.cancelled).sort((a, b) => a.createdAt - b.createdAt)
            const peopleForResponse = permissions.can('getSensitiveFields', subject('eventId', { eventId: event.eventId })) ? people : people.map(({ kp, health, ...rest }) => rest)
            return { ...b, people: peopleForResponse } as TBookingResponse
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
