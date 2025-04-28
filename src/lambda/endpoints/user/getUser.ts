import type { Jsonify } from 'type-fest' // Ensure 'type-fest' is installed or replace with the correct source

import type { ContextUser, ContextWithUser } from '../../middleware/context'
import { HandlerWrapper } from '../../utils'

export const getUser = HandlerWrapper(['get', 'currentUser'], async (event, context) => {
  return { loggedIn: context.user !== undefined, user: context.user }
})

export type UserResponseType = Jsonify<{ loggedIn: false; user: undefined } | { loggedIn: true; user: ContextUser }>
