import { subject } from '@casl/ability'

import { BookingSchema, TBooking } from '../../../shared/schemas/booking'
import { DB, DBBooking, DBPerson } from '../../dynamo'
import { HandlerWrapper } from '../../utils'
import { ElectroEvent } from 'electrodb'

export type TUserBookingsResponseType = {
  bookings: TBooking[]
}

export const getUserBookings = HandlerWrapper(
  (res) => ['get', 'ownBookings'],
  async (req, res) => {
    const user = res.locals.user
    if (!user) {
        res.json({ bookings: [] } as TUserBookingsResponseType)
    } else {
        const bookingsResult = await DB.collections.bookingByUserId({userId: user.userId}).go()
        const bookings: TBooking[] = bookingsResult.data.booking.map(b => {return {...b, people: bookingsResult.data.person.filter((p) => p.eventId === b.eventId).sort((a,b) => a.createdAt - b.createdAt)} as TBooking})
        res.json({ bookings })
    }
  },
)
