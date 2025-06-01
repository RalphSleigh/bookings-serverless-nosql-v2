import cookie from 'cookie'
import { RequestHandler } from 'express'
import jwt from 'jsonwebtoken'

import { getPermissionsFromUser } from '../../shared/permissions'
import { EventSchema } from '../../shared/schemas/event'
import { RoleSchema } from '../../shared/schemas/role'
import { UserSchema } from '../../shared/schemas/user'
import { DB, DBEvent } from '../dynamo'
import { TBooking } from '../../shared/schemas/booking'

export const ownBookingMiddleware: RequestHandler = async (req, res, next) => {
  try {
    const event = res.locals.event
    const user = res.locals.user
    if (!event || !user) {
      throw new Error('Event not Found or User not authenticated')
    }

    const bookingResult = await DB.collections.bookingByUserId({userId: user.userId, eventId: event.eventId}).go()
    const booking = bookingResult.data.booking[0]
    if (!booking) {
      next()
    } else {
      res.locals.booking = {...booking, people: bookingResult.data.person.filter((p) => p.eventId === booking.eventId)} as TBooking
      next()
    }
  } catch (error) {
    console.log(error)
    throw error
  }
}
