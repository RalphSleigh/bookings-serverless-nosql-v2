import type { Jsonify } from 'type-fest' // Ensure 'type-fest' is installed or replace with the correct source

import { ContextUser, UserSchema } from '../../../shared/schemas/user'
import { DB, DBUser } from '../../dynamo'
import { HandlerWrapperLoggedIn } from '../../utils'

export type TUserNopeListUpdate = {
  eventId: string
  state: boolean
}

export const updateUserEmailNopeList = HandlerWrapperLoggedIn<{}, TUserNopeListUpdate>(
  (res) => ['update', 'userPreferences'],
  async (req, res) => {
    const user = res.locals.user
    const list = res.locals.user.preferences.emailNopeList
    const { eventId, state } = req.body

    if (state == true) {
      if (list.includes(eventId)) {
        //added already
      } else {
        list.push(eventId)
        const validatedUser = UserSchema.parse({ ...user, preferences: { ...user.preferences, emailNopeList: list } })
        DBUser.patch({ sub: validatedUser.sub })
          .set({ preferences: { emailNopeList: validatedUser.preferences.emailNopeList } })
          .go()
      }
    } else {
      if (list.includes(eventId)) {
        const newList = list.filter((e) => e !== eventId)
        const validatedUser = UserSchema.parse({ ...user, preferences: { ...user.preferences, emailNopeList: newList } })
        DBUser.patch({ sub: validatedUser.sub })
          .set({ preferences: { emailNopeList: validatedUser.preferences.emailNopeList } })
          .go()
      } else {
        //not in list
      }
    }

    res.status(200).json({ success: true })
  },
)
