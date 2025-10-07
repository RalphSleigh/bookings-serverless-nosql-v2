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
          if (user.data.isEnrolledIn2Sv === false) throw new Error('User does not have 2FA enabled on account')
        } catch (e) {
          res.status(400).json({ message: 'In big camp mode, users must have 2FA enabled on their Woodcraft GSuite account to be assigned roles.' })
          return
        }
      }

      await DBRole.create(validatedRole).go()

      await enqueueAsyncTask({
        type: 'discordMessage',
        data: {
          message: `${currentUser.name} assigned ${targetUser.name} role ${validatedRole.role} for event ${event.name}`,
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
