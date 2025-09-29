import { subject } from '@casl/ability'
import { drive_v3 } from '@googleapis/drive'

import { TPerson } from '../../../shared/schemas/person'
import { TUser, UserSchema } from '../../../shared/schemas/user'
import { DBUser } from '../../dynamo'
import { getCampersFromSheet, getEventHasSheet } from '../../sheetsInput'
import { HandlerWrapper } from '../../utils'

export type TDataFromSheetType = {
  people: TPerson[]
}

export const getDataFromSheetEndpoint = HandlerWrapper<{ userId: string }, TDataFromSheetType>(
  (req, res) => ['getSheetData', subject('eventBookingIds', { eventId: res.locals.event.eventId, userId: req.params.userId })],
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
      user = UserSchema.parse(userResult.data[0])
    }

    const data = await getCampersFromSheet(res.locals.config, event, user)

    if (data) {
      res.json({ people: data } as TDataFromSheetType)
    } else {
      res.status(500).json({ message: 'Error getting data from sheet' })
    }
  },
)
