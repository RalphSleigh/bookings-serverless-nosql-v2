import { QueryFunctionContext, queryOptions, useQuery } from '@tanstack/react-query'
import { fetchAfterUserQuery } from './fetchAfterUser';
import { GetEventBookingsResponseType } from '../../../lambda/endpoints/event/manage/getEventBookings';
import { GetEventBookingHistoryResponseType } from '../../../lambda/endpoints/event/manage/getEventBookingHistory';

export const getEventBookingHistoryQueryOptions = (eventId: string, userId: string) => queryOptions({
    queryKey: ['event', eventId, 'booking', userId],
    queryFn: fetchAfterUserQuery<GetEventBookingHistoryResponseType>(`/api/event/${eventId}/manage/bookingHistory/${userId}`),
    staleTime: 0,
    refetchOnWindowFocus: true,
  })

