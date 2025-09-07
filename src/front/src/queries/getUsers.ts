import { QueryFunctionContext, queryOptions, useQuery } from '@tanstack/react-query'
import { fetchAfterUserQuery } from './fetchAfterUser';
import { GetUsersResponseType } from '../../../lambda/endpoints/event/manage/getUsers';

export const getUsersQueryOptions = (eventId: string) => queryOptions({
    queryKey: ['users'],
    queryFn: fetchAfterUserQuery<GetUsersResponseType>(`/api/event/${eventId}/manage/users`),
    staleTime: 0,
    refetchOnWindowFocus: true,
  })

