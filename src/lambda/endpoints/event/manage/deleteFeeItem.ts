import { subject } from '@casl/ability'

import { FeeSchema, TFee } from '../../../../shared/schemas/fees'
import { currency } from '../../../../shared/util'
import { enqueueAsyncTask } from '../../../asyncTasks/asyncTaskQueuer'
import { DB, DBBooking, DBFee, DBRole, DBUser } from '../../../dynamo'
import { HandlerWrapper, HandlerWrapperLoggedIn } from '../../../utils'

export type TCreateFeeItemData = {
  fee: TFee
}

export const deleteFeeItem = HandlerWrapperLoggedIn<any, { eventId: string; feeId: string }>(
  (req, res) => ['createFee', subject('eventId', { eventId: req.params.eventId })],
  async (req, res) => {
    try {
      const fee = await DBFee.find({ eventId: req.params.eventId, feeId: req.params.feeId }).go()
      if (!fee.data[0]) {
        return res.status(404).json({ message: 'Fee not found' })
      }
      if (res.locals.permissions.can('createFee', subject('eventId', { eventId: fee.data[0].eventId }))) {
        await DBFee.delete(fee.data[0]).go()
        const booking = await DBBooking.get({
        userId: fee.data[0].userId,
        eventId: fee.data[0].eventId,
      }).go()
      if (!booking.data) throw new Error('Booking not found for fee item')
      await enqueueAsyncTask({
        type: 'discordMessage',
        data: {
          message: `${res.locals.user.name} deleted a ${fee.data[0].type} from booking ${booking.data.basic!.district || booking.data.basic!.name} of ${currency(fee.data[0].amount)} (${fee.data[0].note})`,
        },
      })
        return res.status(204).send()
      }
      return res.status(401).send()
    } catch (error) {
      res.locals.logger.logToPath('Delete Fee Failed')
      res.locals.logger.logToPath(error)
      throw error
    }
  },
)
