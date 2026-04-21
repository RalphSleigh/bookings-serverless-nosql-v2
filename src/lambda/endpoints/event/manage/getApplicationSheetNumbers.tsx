import { subject } from '@casl/ability'

import { DBApplication } from '../../../dynamo'
import { HandlerWrapper } from '../../../utils'
import { getCampersFromSheet } from '../../../sheetsInput'
import { TUser } from '../../../../shared/schemas/user'

export type GetApplicationSheetNumbersResponseType = { numbers: Record<string, number | undefined> }

export const getApplicationSheetNumbers = HandlerWrapper(
  (req, res) => ['getApplications', subject('eventId', { eventId: res.locals.event.eventId })],
  async (req, res) => {
    try {
      const event = res.locals.event
      const applications = await DBApplication.find({ eventId: event.eventId }).go()

      if (applications.data) {

        const approvedApplications = applications.data.filter(a => a.status === 'approved')

        const result: Record<string, number | undefined> = {}

        for (const application of approvedApplications) {
            try {
            const campersFromSheet = await getCampersFromSheet(res.locals.config, res.locals.event, {userId: application.userId} as TUser)
            result[application.userId] = campersFromSheet.length
            } catch (error) {
                result[application.userId] = undefined
            }
                }

        res.json({ numbers: result } as GetApplicationSheetNumbersResponseType)
      } else {
        res.json({ numbers: {} } as GetApplicationSheetNumbersResponseType)
      }
    } catch (error) {
      res.locals.logger.logToPath('Applications query failed')
      res.locals.logger.logToPath(error)
      throw error
    }
  },
)
