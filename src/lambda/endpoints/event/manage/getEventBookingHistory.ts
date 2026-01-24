import { subject } from '@casl/ability'

import { TBooking } from '../../../../shared/schemas/booking'
import { DB } from '../../../dynamo'
import { HandlerWrapper, HandlerWrapperLoggedIn } from '../../../utils'
import { CollectionItem, CollectionResponse, ElectroEvent } from 'electrodb'

export type GetEventBookingHistoryResponseType = { data:  CollectionResponse<
  typeof DB,
  "bookingHistory"
>["data"]  }

export const getEventBookingHistory = HandlerWrapperLoggedIn<{ userId: string, eventId: string }>(
  (req, res) => ['getSensitiveFields', subject('eventId', { eventId: res.locals.event.eventId })],
  async (req, res) => {
    try {
      const event = res.locals.event
      const bookings = await DB.collections.bookingHistory({ eventId: event.eventId, userId: req.params.userId }).go()
      if (bookings.data) {
        res.json({ data: bookings.data })
      } else {
        res.status(404).json({ message: 'No booking history found' } as any)
      }
    } catch (error) {
      res.locals.logger.logToPath('Bookings History query failed')
      res.locals.logger.logToPath(error)
      throw error
    }
  },
)
