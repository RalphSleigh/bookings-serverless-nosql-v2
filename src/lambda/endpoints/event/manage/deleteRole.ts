import { subject } from '@casl/ability'
import { v4 as uuidv4 } from 'uuid'

import { TBooking } from '../../../../shared/schemas/booking'
import { EventRoleSchema, RoleSchema, TRole, TRoleForForm } from '../../../../shared/schemas/role'
import { TUser } from '../../../../shared/schemas/user'
import { DB, DBRole, DBUser } from '../../../dynamo'
import { HandlerWrapper } from '../../../utils'

export const deleteRole = HandlerWrapper<any, { eventId: string; roleId: string }>(
  //this is not the right permission check, we need to get the role to be sure.
  (req, res) => ['viewRoles', subject('eventId', { eventId: res.locals.event.eventId })],
  async (req, res) => {
    try {
      const { eventId, roleId } = req.params

      const role = await DBRole.get({ eventId, roleId }).go()
      if (!role.data) {
        return res.status(404).json({ message: 'Role not found' })
      }

      if (res.locals.permissions.can('delete', subject('role', role.data))) {
        await DBRole.delete({ eventId, roleId }).go()
        return res.status(204).send()
      } 

      return res.status(403).json({ message: 'Forbidden' })
      
    } catch (error) {
      res.locals.logger.logToPath('Create Role Failed')
      res.locals.logger.logToPath(error)
      throw error
    }
  },
)
