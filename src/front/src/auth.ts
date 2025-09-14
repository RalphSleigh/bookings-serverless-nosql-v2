import { UseSuspenseQueryResult } from "@tanstack/react-query"
import { userQueryOptions } from "./queries/user"
import { getUsersQueryOptions } from "./queries/getUsers"
import { UserResponseType } from "../../lambda/endpoints/user/getUser"

export const useAuth = (userQuery: UseSuspenseQueryResult<UserResponseType>) => {
    const user = userQuery.data.loggedIn ? userQuery.data.user: undefined
    const loggedIn = user !== undefined
    const isAvailable = true

    console.log(`returning auth ${isAvailable} ${loggedIn}`)
    return { user, loggedIn, isAvailable }
}
