import { subject } from '@casl/ability'
import { v7 as uuidv7 } from 'uuid'

import { ApplicationSchemaForForm, TApplicationForForm } from '../../../shared/schemas/application'
import { HandlerWrapper } from '../../utils'
import { DBApplication } from '../../dynamo'

export type TCreateApplicationData = {
  application: TApplicationForForm
}

export const createApplicationEndpoint = HandlerWrapper<TCreateApplicationData>(
  (req, res) => ['apply', subject('event', res.locals.event)],
  async (req, res) => {
    try {

      const user = res.locals.user
      if (!user) throw new Error('User must be logged in to apply')

      const validatedApplication = ApplicationSchemaForForm.parse({ ...req.body.application, status: 'pending', userId: user.userId, eventId: res.locals.event.eventId })
      await DBApplication.create(validatedApplication).go()
      res.json({ application: validatedApplication })
    } catch (error) {
      res.locals.logger.logToPath('Create Application Failed')
      res.locals.logger.logToPath(error)
      throw error
    }
  },
)
