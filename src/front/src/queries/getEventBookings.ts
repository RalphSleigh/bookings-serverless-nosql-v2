import { QueryFunctionContext, queryOptions, useQuery } from '@tanstack/react-query'
import { fetchAfterUserQuery } from './fetchAfterUser';
import { GetEventBookingsResponseType } from '../../../lambda/endpoints/event/manage/getEventBookings';

export const getEventBookingsQueryOptions = (eventId: string) => queryOptions({
    queryKey: ['event', eventId, 'bookings'],
    queryFn: fetchAfterUserQuery<GetEventBookingsResponseType>(`/api/event/${eventId}/manage/bookings`),
    staleTime: 0,
    refetchOnWindowFocus: true,
  })

