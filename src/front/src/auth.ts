import { useQuery } from "@tanstack/react-query"
import { userQueryOptions } from "./queries/user"

export const useAuth = () => {
    const userQuery = useQuery(userQueryOptions)
    const user = userQuery.isSuccess ? userQuery.data.loggedIn ? userQuery.data.user: undefined : undefined
    const loggedIn = user !== undefined
    const isAvailable = !userQuery.isStale

    console.log(`returning auth ${isAvailable} ${loggedIn}`)
    return { user, loggedIn, isAvailable }
}
