import { subject } from '@casl/ability'
import { v7 as uuidv7 } from 'uuid'

import { TBooking } from '../../../../shared/schemas/booking'
import { EventRoleSchema, RoleSchema, TRole, TRoleForForm } from '../../../../shared/schemas/role'
import { TUser } from '../../../../shared/schemas/user'
import { DB, DBRole, DBUser } from '../../../dynamo'
import { HandlerWrapper } from '../../../utils'

export type TCreateRoleData = {
  role: TRoleForForm
}

export const createRole = HandlerWrapper<TCreateRoleData>(
  (req, res) => ['create', subject('role', req.body.role)],
  async (req, res) => {
    try {
      const validatedRole = EventRoleSchema.parse({ ...req.body.role, roleId: uuidv7() })
      await DBRole.create(validatedRole).go()
      res.json({ role: validatedRole })
    } catch (error) {
      res.locals.logger.logToPath('Create Role Failed')
      res.locals.logger.logToPath(error)
      throw error
    }
  },
)
