import { QueryFunctionContext, queryOptions, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { userQueryOptions } from './user';

const fetchEnv = async ({client}: QueryFunctionContext ) => {
  const userdata = await client.fetchQuery(userQueryOptions)
  console.log(JSON.stringify(userdata))
  const env = await axios
  .get<{env:String}>(`/api/env`)
  .then((r) => r.data)
  .catch((err) => {
    if (err.status === 404) {
      throw new Error(`Env`)
    }
    throw err
  })
return env
}

export const envQueryOptions = queryOptions({
    queryKey: ['env'],
    queryFn: fetchEnv,
    staleTime: 0,
    refetchOnWindowFocus: true
  })