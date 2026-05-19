import { subject } from '@casl/ability'

import { enqueueAsyncTask } from '../../../asyncTasks/asyncTaskQueuer'
import { DBApplication } from '../../../dynamo'
import { HandlerWrapperLoggedIn } from '../../../utils'

export const deleteApplicationEndpoint = HandlerWrapperLoggedIn<any, { eventId: string; userId: string }>(
  (req, res) => ['approveApplication', subject('eventId', { eventId: res.locals.event.eventId })],
  async (req, res) => {
    try {
      const application = await DBApplication.get({ userId: req.params.userId, eventId: res.locals.event.eventId }).go()
      if (!application.data) {
        return res.status(404).json({ message: 'Application not found' })
      }

      await DBApplication.delete(application.data).go({ response: 'none' })

      await enqueueAsyncTask({
        type: 'discordMessage',
        data: {
          message: `${res.locals.user.name} deleted application from ${application.data.name} (${application.data.district || 'Individual'})`,
        },
      })

      res.json({ application: application.data })
    } catch (error) {
      res.locals.logger.logToPath('Delete Application Failed')
      res.locals.logger.logToPath(error)
      throw error
    }
  },
)
