import { subject } from '@casl/ability'
import { v7 as uuidv7 } from 'uuid'

import { DBApplication } from '../../../dynamo'
import { HandlerWrapper } from '../../../utils'

export const declineApplicationEndpoint = HandlerWrapper<any, { eventId: string; userId: string }>(
  (req, res) => ['approveApplication', subject('eventId', { eventId: res.locals.event.eventId })],
  async (req, res) => {
    try {
      const application = await DBApplication.get({ userId: req.params.userId, eventId: res.locals.event.eventId }).go()
      if (!application.data) {
        return res.status(404).json({ message: 'Application not found' })
      }

      const updatedApplication = await DBApplication.patch(application.data).set({ status: 'declined' }).go({ response: 'all_new' })
      res.json({ application: updatedApplication.data })
    } catch (error) {
      res.locals.logger.logToPath('Create Application Failed')
      res.locals.logger.logToPath(error)
      throw error
    }
  },
)
