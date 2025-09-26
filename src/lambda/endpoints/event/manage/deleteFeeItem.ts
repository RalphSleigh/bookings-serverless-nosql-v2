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

export const deleteFeeItem = HandlerWrapper<any, { eventId: string; feeId: string }>(
  (req, res) => ['createFee', subject('eventId', { eventId: req.params.eventId })],
  async (req, res) => {
    try {
      const fee = await DBFee.find({ eventId: req.params.eventId, feeId: req.params.feeId }).go()
      if (!fee.data[0]) {
        return res.status(404).json({ message: 'Fee not found' })
      }
      if (res.locals.permissions.can('createFee', subject('eventId', { eventId: fee.data[0].eventId }))) {
        await DBFee.delete(fee.data[0]).go()
        return res.status(204).send()
      }
    } catch (error) {
      res.locals.logger.logToPath('Delete Fee Failed')
      res.locals.logger.logToPath(error)
      throw error
    }
  },
)
