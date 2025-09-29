import { subject } from '@casl/ability'

import { TBooking } from '../../../../shared/schemas/booking'
import { FeeSchema, TFee } from '../../../../shared/schemas/fees'
import { EventRoleSchema, RoleSchema, TRole, TRoleForForm } from '../../../../shared/schemas/role'
import { TUser } from '../../../../shared/schemas/user'
import { DB, DBFee, DBRole, DBUser } from '../../../dynamo'
import { HandlerWrapper } from '../../../utils'

export type TCreateFeeItemData = {
  fee: TFee
}

export const createFeeItem = HandlerWrapper<{}, TCreateFeeItemData>(
  (req, res) => ['createFee', subject('eventId', { eventId: req.body.fee.eventId })],
  async (req, res) => {
    try {
      const validatedFee = FeeSchema.parse({ ...req.body.fee })
      await DBFee.create(validatedFee).go()
      res.json({ fee: validatedFee })
    } catch (error) {
      res.locals.logger.logToPath('Create Fee Failed')
      res.locals.logger.logToPath(error)
      throw error
    }
  },
)
