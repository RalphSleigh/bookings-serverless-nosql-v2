import { queryOptions } from '@tanstack/react-query'
import axios from 'axios'

import { UserResponseType } from '../../../lambda/endpoints/user/getUser'

export const userQueryOptions = queryOptions({
  queryKey: ['user'],
  queryFn: () => fetchUser(),
  staleTime: 100,
  refetchOnWindowFocus: true,
  refetchInterval: 1000 * 60,
})

const fetchUser = async () => {
  const user = await axios
    .get<UserResponseType>(`/api/user/current`)
    .then((r) => r.data)
    .catch((err) => {
      if (err.status === 404) {
        throw new Error(`User`)
      }
      throw err
    })

  return user
}
