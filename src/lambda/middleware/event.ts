import cookie from 'cookie'
import { RequestHandler } from 'express'
import jwt from 'jsonwebtoken'

import { getPermissionsFromUser } from '../../shared/permissions'
import { EventSchema } from '../../shared/schemas/event'
import { RoleSchema } from '../../shared/schemas/role'
import { UserSchema } from '../../shared/schemas/user'
import { DB, DBEvent } from '../dynamo'

export const eventMiddleware: RequestHandler = async (req, res, next) => {
  try {
    const eventId = req.params.eventId
    if (!eventId) {
      throw new Error('Event ID is required in the request parameters')
    }

    const event = await DBEvent.get({ eventId }).go()

    if (!event.data) {
      throw new Error(`Event with ID ${eventId} not found`)
    }

    res.locals.event = EventSchema.parse(event.data)
    next()
  } catch (error) {
    console.log(error)
    throw error
  }
}
