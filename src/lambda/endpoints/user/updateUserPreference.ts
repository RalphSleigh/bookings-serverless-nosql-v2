import type { Jsonify } from 'type-fest' // Ensure 'type-fest' is installed or replace with the correct source

import { ContextUser, UserSchema } from '../../../shared/schemas/user'
import { enqueueAsyncTask } from '../../asyncTasks/asyncTaskQueuer'
import { DB, DBUser } from '../../dynamo'
import { HandlerWrapperLoggedIn } from '../../utils'

export type TUserPreferenceUpdate = {
  eventId: string
  preference: 'emailNopeList' | 'driveSync'
  state: boolean
}

export const updateUserPreference = HandlerWrapperLoggedIn<{}, TUserPreferenceUpdate>(
  (res) => ['update', 'userPreferences'],
  async (req, res) => {
    const user = res.locals.user

    const { preference, eventId, state } = req.body

    if (preference === 'emailNopeList') {
      const list = res.locals.user.preferences.emailNopeList
      if (state == true) {
        if (list.includes(eventId)) {
          //added already
        } else {
          list.push(eventId)
          const validatedUser = UserSchema.parse({ ...user, preferences: { ...user.preferences, emailNopeList: list } })
          await DBUser.patch({ sub: validatedUser.sub })
            .set({ preferences: { emailNopeList: validatedUser.preferences.emailNopeList } })
            .go()
        }
      } else {
        if (list.includes(eventId)) {
          const newList = list.filter((e) => e !== eventId)
          const validatedUser = UserSchema.parse({ ...user, preferences: { ...user.preferences, emailNopeList: newList } })
          await DBUser.patch({ sub: validatedUser.sub })
            .set({ preferences: { emailNopeList: validatedUser.preferences.emailNopeList } })
            .go()
        } else {
          //not in list
        }
      }
    } else if (preference === 'driveSync') {
      const list = res.locals.user.preferences.driveSyncList
      if (state == true) {
        if (list.includes(eventId)) {
          //added already
        } else {
          list.push(eventId)
          const validatedUser = UserSchema.parse({ ...user, preferences: { ...user.preferences, driveSyncList: list } })
          await DBUser.patch({ sub: validatedUser.sub })
            .set({ preferences: { driveSyncList: validatedUser.preferences.driveSyncList } })
            .go()

          await enqueueAsyncTask({
            type: 'driveSync',
            data: {
              eventId: eventId,
            },
          })
        }
      } else {
        if (list.includes(eventId)) {
          const newList = list.filter((e) => e !== eventId)
          const validatedUser = UserSchema.parse({ ...user, preferences: { ...user.preferences, driveSyncList: newList } })
          await DBUser.patch({ sub: validatedUser.sub })
            .set({ preferences: { driveSyncList: validatedUser.preferences.driveSyncList } })
            .go()
        } else {
          //not in list
        }
      }
    }
    res.status(200).json({ preference, eventId, state } as Jsonify<TUserPreferenceUpdate>)
  },
)
