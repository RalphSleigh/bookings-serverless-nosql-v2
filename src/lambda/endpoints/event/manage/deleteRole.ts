import { subject } from '@casl/ability'

import { TBooking } from '../../../../shared/schemas/booking'
import { EventRoleSchema, RoleSchema, TRole, TRoleForForm } from '../../../../shared/schemas/role'
import { TUser } from '../../../../shared/schemas/user'
import { enqueueAsyncTask } from '../../../asyncTasks/asyncTaskQueuer'
import { DB, DBRole, DBUser } from '../../../dynamo'
import { HandlerWrapper, HandlerWrapperLoggedIn } from '../../../utils'

export const deleteRole = HandlerWrapperLoggedIn<any, { eventId: string; roleId: string }>(
  //this is not the right permission check, we need to get the role to be sure.
  (req, res) => ['viewRoles', subject('eventId', { eventId: res.locals.event.eventId })],
  async (req, res) => {
    try {
      const { eventId, roleId } = req.params
      const event = res.locals.event

      const role = await DBRole.get({ eventId, roleId }).go()
      if (!role.data) {
        return res.status(404).json({ message: 'Role not found' })
      }

      const validatedRole = RoleSchema.parse(role.data)

      if (res.locals.permissions.can('delete', subject('role', validatedRole))) {
        await DBRole.delete({ eventId, roleId }).go()

        const userResult = await DBUser.find({ userId: validatedRole.userId }).go()
        if (!userResult.data || userResult.data.length === 0) throw new Error("Can't find user")
        const targetUser = userResult.data[0] as TUser

        await enqueueAsyncTask({
          type: 'discordMessage',
          data: {
            message: `${res.locals.user.name} **revoked** ${targetUser.name} role ${validatedRole.role} for event ${event.name}`,
          },
        })

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
