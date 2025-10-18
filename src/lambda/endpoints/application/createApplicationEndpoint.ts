import { subject } from '@casl/ability'
import { v7 as uuidv7 } from 'uuid'

import { ApplicationSchemaForForm, TApplicationForForm } from '../../../shared/schemas/application'
import { enqueueAsyncTask } from '../../asyncTasks/asyncTaskQueuer'
import { DBApplication } from '../../dynamo'
import { HandlerWrapper, HandlerWrapperLoggedIn } from '../../utils'

export type TCreateApplicationData = {
  application: TApplicationForForm
}

export const createApplicationEndpoint = HandlerWrapperLoggedIn<{}, TCreateApplicationData>(
  (req, res) => ['apply', subject('event', res.locals.event)],
  async (req, res) => {
    try {
      const user = res.locals.user
      if (!user) throw new Error('User must be logged in to apply')

      const validatedApplication = ApplicationSchemaForForm.parse({ ...req.body.application, status: 'pending', userId: user.userId, eventId: res.locals.event.eventId })
      await DBApplication.create(validatedApplication).go()

      await enqueueAsyncTask({
        type: 'emailApplicationReceived',
        data: {
          eventId: res.locals.event.eventId,
          userId: res.locals.user.userId,
        }
      })

      await enqueueAsyncTask({
        type: 'discordMessage',
        data: {
          message: `Application received from ${validatedApplication.name} (${validatedApplication.email}) - ${validatedApplication.type === 'group' ? validatedApplication.district : validatedApplication.district ? `Individual - ${validatedApplication.district}` : 'Individual'}`,
        },
      })

      res.json({ application: validatedApplication })
    } catch (error) {
      res.locals.logger.logToPath('Create Application Failed')
      res.locals.logger.logToPath(error)
      throw error
    }
  },
)
