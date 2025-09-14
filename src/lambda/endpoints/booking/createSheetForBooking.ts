import { subject } from '@casl/ability'
import { CreateEntityItem } from 'electrodb'
import { parseAcceptLanguage } from 'intl-parse-accept-language'

import { BookingSchema, TBooking } from '../../../shared/schemas/booking'
import { DBBooking, DBBookingHistory, DBPerson, DBPersonHistory, DBUser } from '../../dynamo'
import { createSheetForBooking } from '../../sheetsInput'
import { HandlerWrapper } from '../../utils'

export type TCreateSheetForBooking = {
  userId: string
  eventId: string
  name: string
  email: string
  district: string
}

export const createSheetForBookingEndpoint = HandlerWrapper<TCreateSheetForBooking, { userId: string }>(
  (req, res) => ['createSheet', subject('eventBookingIds', { eventId: res.locals.event.eventId, userId: req.params.userId })],
  async (req, res) => {
    const userQuery = await DBUser.find({ userId: req.params.userId }).go()
    if (!userQuery.data[0]) {
      return res.status(400).json({ message: 'User not found' })
    }

    const event = res.locals.event
    const user = userQuery.data[0]

    const locales = parseAcceptLanguage(req.headers['accept-language'], {
      validate: Intl.DateTimeFormat.supportedLocalesOf,
    })

    const sheet = await createSheetForBooking(res.locals.config, event, user, req.body, locales)

    if (sheet) {
      res.status(201).json({ sheet: sheet })
    } else {
      res.status(500).json({ message: 'Error creating sheet' })
    }
  },
)
