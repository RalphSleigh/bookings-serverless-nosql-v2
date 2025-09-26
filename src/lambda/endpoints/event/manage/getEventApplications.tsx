import { subject } from '@casl/ability'

import { TFee } from '../../../../shared/schemas/fees'
import { DB, DBApplication, DBFee, DBRole } from '../../../dynamo'
import { HandlerWrapper } from '../../../utils'
import { TApplication } from '../../../../shared/schemas/application'

export type GetEventApplicationsResponseType = { applications: TApplication[] }

export const getEventApplications = HandlerWrapper(
  (req, res) => ['getApplications', subject('eventId', { eventId: res.locals.event.eventId })],
  async (req, res) => {
    try {
      const event = res.locals.event
      const applications = await DBApplication.find({ eventId: event.eventId }).go()

      if (applications.data) {
        res.json({ applications: applications.data })
      } else {
        res.json({ applications: [] } as GetEventApplicationsResponseType)
      }
    } catch (error) {
      res.locals.logger.logToPath('Applications query failed')
      res.locals.logger.logToPath(error)
      throw error
    }
  },
)
