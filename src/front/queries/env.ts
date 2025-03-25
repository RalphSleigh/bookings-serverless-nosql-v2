import { queryOptions } from '@tanstack/react-query'
import axios from 'axios'

export const envQueryOptions = queryOptions({
    queryKey: ['env'],
    queryFn: () => fetchEnv(),
    staleTime: 0,
    refetchOnWindowFocus: true
  })


const fetchEnv = async () => {
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