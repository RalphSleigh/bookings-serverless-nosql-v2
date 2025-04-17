import { HandlerWrapper } from "../../utils";
import type { ContextUser, ContextWithUser } from "../../middleware/context"
import type { Jsonify } from "type-fest"; // Ensure 'type-fest' is installed or replace with the correct source

export const getUser = HandlerWrapper(async (event, context) => {
    await new Promise((resolve) => setTimeout(resolve, 3000))
    return { loggedIn: context.user !== undefined, user: context.user }
})

export type UserResponseType = Jsonify<{loggedIn: false, user: undefined} | {loggedIn: true, user: ContextUser}>
