import { QueryFunctionContext, queryOptions, useQuery } from '@tanstack/react-query'
import { fetchAfterUserQuery } from './fetchAfterUser';
import { GetEventBookingsResponseType } from '../../../lambda/endpoints/event/manage/getEventBookings';
import { GetEventBookingHistoryResponseType } from '../../../lambda/endpoints/event/manage/getEventBookingHistory';
import { GetGraphDataResponseType } from '../../../lambda/endpoints/event/manage/getGraphData';

export const getEventGraphDataQueryOptions = (eventId: string) => queryOptions({
    queryKey: ['eventGraphData', eventId],
    queryFn: fetchAfterUserQuery<GetGraphDataResponseType>(`/api/event/${eventId}/manage/graphData`),
    staleTime: 0,
    refetchOnWindowFocus: true,
  })

