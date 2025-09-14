import { subject } from '@casl/ability'

import { getEventHasSheet } from '../../sheetsInput'
import { HandlerWrapper } from '../../utils'
import { DBUser } from '../../dynamo'
import { TUser } from '../../../shared/schemas/user'
import { drive_v3 } from '@googleapis/drive'

export type TBookingHasSheetResponseType = {
  sheet: drive_v3.Schema$File | null
}

export const getBookingHasSheet = HandlerWrapper<TBookingHasSheetResponseType>(
  (req, res) => ['getSheet', subject('eventBooking', { event: res.locals.event, booking: res.locals.booking })],
  async (req, res) => {
    const userId = req.params.userId
    let user: TUser | undefined = res.locals.user
    const event = res.locals.event

        if (!user) {
      return res.status(401).json({ message: 'Unauthorized' })
    }

    if(user.userId !== userId){
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
