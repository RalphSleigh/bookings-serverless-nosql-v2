import { subject } from '@casl/ability'
import { admin } from '@googleapis/admin'
import { v7 as uuidv7 } from 'uuid'

import { TBooking } from '../../../../shared/schemas/booking'
import { EventRoleSchema, RoleSchema, TRole, TRoleForForm } from '../../../../shared/schemas/role'
import { TUser } from '../../../../shared/schemas/user'
import { enqueueAsyncTask } from '../../../asyncTasks/asyncTaskQueuer'
import { DB, DBRole, DBUser } from '../../../dynamo'
import { getAuthClientForScope } from '../../../googleAuthClientHack'
import { HandlerWrapperLoggedIn } from '../../../utils'

export type TCreateRoleData = {
  role: TRoleForForm
}

const exemptRoles: TRole['role'][] = []

export const createRole = HandlerWrapperLoggedIn<{}, TCreateRoleData>(
  (req, res) => ['create', subject('role', req.body.role)],
  async (req, res) => {
    try {
      const currentUser = res.locals.user
      const config = res.locals.config
      const event = res.locals.event
      const validatedRole = EventRoleSchema.parse({ ...req.body.role, roleId: uuidv7() })

      const userResult = await DBUser.find({ userId: validatedRole.userId }).go()
      if (!userResult.data || userResult.data.length === 0) throw new Error("Can't find user")
      const targetUser = userResult.data[0] as TUser

      if (event.bigCampMode && !exemptRoles.includes(validatedRole.role)) {
        try {
          // Check that the user has 2FA enabled on their Woodcraft GSuite account

          if (!targetUser.isWoodcraft) throw new Error('User is not a Woodcraft GSuite account')
          const auth = await getAuthClientForScope(config, ['https://www.googleapis.com/auth/admin.directory.user.readonly'])

          const directory = admin({ version: 'directory_v1', auth })
          let user
          try {
            user = await directory.users.get({
              userKey: targetUser.sub.replace('google-oauth2|', ''),
            })
          } catch (e) {
            throw new Error('User is not a Woodcraft GSuite account')
          }
          if (!(config.BIG_ROLE_OU_ALLOWLIST && config.BIG_ROLE_OU_ALLOWLIST.includes(user.data.orgUnitPath || ''))) throw new Error('User is not in an allowed OU for big camp role assignment')
          if (user.data.isEnrolledIn2Sv === false) throw new Error('Users must have 2FA enabled on their Woodcraft GSuite account to be assigned roles.')
        } catch (e: any) {
          res.status(400).json({ message: e.message ?? 'Error checking account in WCF Directory' })
          return
        }
      }

      await DBRole.create(validatedRole).go()

      await enqueueAsyncTask({
        type: 'discordMessage',
        data: {
          message: `${currentUser.name} **granted** ${targetUser.name} role ${validatedRole.role} for event ${event.name}`,
        },
      })

      await enqueueAsyncTask({
        type: 'emailManagerDataAccess',
        data: {
          eventId: event.eventId,
          userId: targetUser.userId,
        },
      })

      res.json({ role: validatedRole })
    } catch (error) {
      res.locals.logger.logToPath('Create Role Failed')
      res.locals.logger.logToPath(error)
      throw error
    }
  },
)
