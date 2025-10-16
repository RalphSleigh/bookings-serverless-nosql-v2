import { subject } from '@casl/ability'

import { TBooking } from '../../../../shared/schemas/booking'
import { DB, DBUser } from '../../../dynamo'
import { HandlerWrapper } from '../../../utils'
import { TUser } from '../../../../shared/schemas/user'

export type GetUsersResponseType = { users: TUser[] }

export const getUsers = HandlerWrapper(
  (req, res) => ['get','users'],
  async (req, res) => {
    try {
      const users = await DBUser.scan.go({pages: "all"})
      if (users.data) {
        res.json({ users: users.data })
      } else {
        res.json({ users: [] } as GetUsersResponseType)
      }
    } catch (error) {
      res.locals.logger.logToPath('Users query failed')
      res.locals.logger.logToPath(error)
      throw error
    }
  },
)