import { subject } from '@casl/ability'

import { TFee } from '../../../../shared/schemas/fees'
import { DB, DBFee, DBRole } from '../../../dynamo'
import { HandlerWrapper } from '../../../utils'

export type GetEventFeesResponseType = { fees: TFee[] }

export const getEventFees = HandlerWrapper(
  (req, res) => ['getFees', subject('eventId', { eventId: res.locals.event.eventId })],
  async (req, res) => {
    try {
      const event = res.locals.event
      const fees = await DBFee.find({ eventId: event.eventId }).go()

      if (fees.data) {
        res.json({ fees: fees.data })
      } else {
        res.json({ fees: [] } as GetEventFeesResponseType)
      }
    } catch (error) {
      res.locals.logger.logToPath('Fees query failed')
      res.locals.logger.logToPath(error)
      throw error
    }
  },
)
