import cookie from 'cookie'
import { ElectroEvent } from 'electrodb'
import { RequestHandler } from 'express'
import jwt from 'jsonwebtoken'

import { getPermissionsFromUser } from '../../shared/permissions'
import { TBooking } from '../../shared/schemas/booking'
import { EventSchema } from '../../shared/schemas/event'
import { RoleSchema } from '../../shared/schemas/role'
import { UserSchema } from '../../shared/schemas/user'
import { DB, DBEvent } from '../dynamo'

export const ownBookingMiddleware: RequestHandler = async (req, res, next) => {
  try {
    const event = res.locals.event
    const user = res.locals.user

    if(req.params.splat[0] === 'edit'){
      next()
      return
    }

    if (!event || !user) {
      res.status(401).send('Event not Found or User not authenticated')
      return
      //throw new Error('Event not Found or User not authenticated')
    }

    const bookingResult = await DB.collections.bookingByUserId({ userId: user.userId, eventId: event.eventId }).go()
    const booking = bookingResult.data.booking[0]
    if (!booking) {
      next()
    } else {
      res.locals.booking = { ...booking, people: bookingResult.data.person.filter((p) => p.eventId === booking.eventId && !p.cancelled) } as TBooking
      res.locals.fees = bookingResult.data.fee.filter((f) => f.eventId === event.eventId)
      next()
    }
  } catch (error) {
    res.locals.logger.logToPath(error)
    throw error
  }
}
