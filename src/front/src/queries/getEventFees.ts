import { QueryFunctionContext, queryOptions, useQuery } from '@tanstack/react-query'
import { fetchAfterUserQuery } from './fetchAfterUser';
import { GetEventFeesResponseType } from '../../../lambda/endpoints/event/manage/getEventFees';

export const getEventFeesQueryOptions = (eventId: string) => queryOptions({
    queryKey: ['event', eventId, 'fees'],
    queryFn: fetchAfterUserQuery<GetEventFeesResponseType>(`/api/event/${eventId}/manage/fees`),
    staleTime: 0,
    refetchOnWindowFocus: true,
  })

