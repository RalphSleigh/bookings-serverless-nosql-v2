import { subject } from '@casl/ability'

import { TUser } from '../../../../shared/schemas/user'
import { DBApplication } from '../../../dynamo'
import { getAuthClientForScope } from '../../../googleAuthClientHack'
import { getCampersFromSheet } from '../../../sheetsInput'
import { HandlerWrapper } from '../../../utils'

export type GetApplicationSheetNumbersResponseType = { numbers: Record<string, number | null> }

export const getApplicationSheetNumbers = HandlerWrapper(
  (req, res) => ['getApplications', subject('eventId', { eventId: res.locals.event.eventId })],
  async (req, res) => {
    try {
      const config = res.locals.config
      const event = res.locals.event
      const applications = await DBApplication.find({ eventId: event.eventId }).go()

      if (applications.data) {
        const approvedApplications = applications.data.filter((a) => a.status === 'approved')

        const result: Record<string, number | null> = {}

        //preload this into the cache
        await getAuthClientForScope(config, ['https://www.googleapis.com/auth/drive.readonly'])

        const promises = approvedApplications.map((application) =>
          getCampersFromSheet(res.locals.config, res.locals.event, { userId: application.userId } as TUser)
            .then((campers) => ({ campers: campers.length, id: application.userId }))
            .catch((error) => ({ campers: 0, id: application.userId })),
        )

        const results = await Promise.all(promises)

        for (const application of results) {
          try {
            result[application.id] = application.campers
          } catch (error) {
            result[application.id] = null
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
