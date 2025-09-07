import { subject } from '@casl/ability'

import { TBooking } from '../../../../shared/schemas/booking'
import { DB, DBRole } from '../../../dynamo'
import { HandlerWrapper } from '../../../utils'
import { TRole } from '../../../../shared/schemas/role'

export type GetEventRolesResponseType = { roles: TRole[] }

export const getEventRoles = HandlerWrapper(
  (req, res) => ['viewRoles', subject('eventId', {eventId: res.locals.event.eventId})],
  async (req, res) => {
    try {
      const event = res.locals.event
      const roles = await DBRole.find({eventId: event.eventId}).go()
    
      if(roles.data){
        res.json({ roles: roles.data })
      } else {
        res.json({ roles: [] } as GetEventRolesResponseType)
      }
    } catch (error) {
      res.locals.logger.logToPath('Roles query failed')
      res.locals.logger.logToPath(error)
      throw error
    }
  },
)
