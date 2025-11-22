import { subject } from '@casl/ability'

import { FeeForCreateSchema, TFee } from '../../../../shared/schemas/fees'
import { currency } from '../../../../shared/util'
import { enqueueAsyncTask } from '../../../asyncTasks/asyncTaskQueuer'
import { DB, DBBooking, DBFee, DBRole, DBUser } from '../../../dynamo'
import { HandlerWrapper, HandlerWrapperLoggedIn } from '../../../utils'

export type TCreateFeeItemData = {
  fee: TFee
}

export const createFeeItem = HandlerWrapperLoggedIn<{}, TCreateFeeItemData>(
  (req, res) => ['createFee', subject('eventId', { eventId: req.body.fee.eventId })],
  async (req, res) => {
    try {
      const validatedFee = FeeForCreateSchema.parse({ ...req.body.fee })
      await DBFee.create(validatedFee).go()

      const booking = await DBBooking.get({
        userId: validatedFee.userId,
        eventId: validatedFee.eventId,
      }).go()

      if (!booking.data) throw new Error('Booking not found for fee item')

      if (validatedFee.type === 'payment') {
        await enqueueAsyncTask({
          type: 'discordMessage',
          data: {
            message: `${res.locals.user.name} added a payment to booking ${booking.data.basic!.district || booking.data.basic!.name} of ${currency(validatedFee.amount)} (${validatedFee.note})`,
          },
        })
      } else {
        await enqueueAsyncTask({
          type: 'discordMessage',
          data: {
            message: `${res.locals.user.name} added an adjustment to booking ${booking.data.basic!.district || booking.data.basic!.name} of ${currency(validatedFee.amount)} (${validatedFee.note})`,
          },
        })
      }
      res.json({ fee: validatedFee })
    } catch (error) {
      res.locals.logger.logToPath('Create Fee Failed')
      res.locals.logger.logToPath(error)
      throw error
    }
  },
)
