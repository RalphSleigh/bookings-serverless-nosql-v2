import type { Jsonify } from 'type-fest' // Ensure 'type-fest' is installed or replace with the correct source

import { HandlerWrapper } from '../../utils'
import { ContextUser } from '../../../shared/schemas/user'

export const getUser = HandlerWrapper(res => ['get', 'currentUser'], async (req, res) => {
  res.json({ loggedIn: res.locals.user !== undefined, user: res.locals.user })
})

export type UserResponseType = Jsonify<{ loggedIn: false; user: undefined } | { loggedIn: true; user: ContextUser }>
