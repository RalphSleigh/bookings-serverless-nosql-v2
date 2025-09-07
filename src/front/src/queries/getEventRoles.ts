import { QueryFunctionContext, queryOptions, useQuery } from '@tanstack/react-query'
import { fetchAfterUserQuery } from './fetchAfterUser';
import { GetEventRolesResponseType } from '../../../lambda/endpoints/event/manage/getEventRoles';

export const getEventRolesQueryOptions = (eventId: string) => queryOptions({
    queryKey: ['event', eventId, 'roles'],
    queryFn: fetchAfterUserQuery<GetEventRolesResponseType>(`/api/event/${eventId}/manage/roles`),
    staleTime: 0,
    refetchOnWindowFocus: true,
  })

