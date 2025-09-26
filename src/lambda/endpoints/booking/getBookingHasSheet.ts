import { subject } from '@casl/ability'
import { drive_v3 } from '@googleapis/drive'

import { TUser } from '../../../shared/schemas/user'
import { DBUser } from '../../dynamo'
import { getEventHasSheet } from '../../sheetsInput'
import { HandlerWrapper } from '../../utils'

export type TBookingHasSheetResponseType = {
  sheet: drive_v3.Schema$File | null
}

export const getBookingHasSheet = HandlerWrapper<TBookingHasSheetResponseType, { userId: string }>(
  (req, res) => ['getSheet', subject('eventBookingIds', { eventId: res.locals.event.eventId, userId: req.params.userId })],
  async (req, res) => {
    const userId = req.params.userId
    let user: TUser | undefined = res.locals.user
    const event = res.locals.event

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    if (user.userId !== userId) {
      //fetch the user for the userId in the path
      const userResult = await DBUser.find({ userId: userId }).go()
      user = userResult.data[0]
    }

    const sheet = await getEventHasSheet(res.locals.config, event, user)

    if (sheet) {
      res.json({ sheet: sheet } as TBookingHasSheetResponseType)
    } else {
      res.json({ sheet: null } as TBookingHasSheetResponseType)
    }
  },
)
