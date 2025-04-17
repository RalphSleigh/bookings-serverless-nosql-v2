import { QueryFunctionContext } from "@tanstack/react-query"
import axios from "axios"
import { userQueryOptions } from "./user"

export const fetchAfterUserQuery = <T>(url: string) => async ({client}: QueryFunctionContext ): Promise<T> => {
    const userdata = await client.fetchQuery(userQueryOptions)
    //console.log(JSON.stringify(userdata))
    const result = await axios.get<T>(url)
    return result.data
  }