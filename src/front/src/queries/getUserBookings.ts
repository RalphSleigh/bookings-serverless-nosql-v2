import { QueryFunctionContext, queryOptions, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { fetchAfterUserQuery } from './fetchAfterUser';
import { getEventsResponseType } from '../../../lambda/endpoints/event/getEvents';
import { TUserBookingsResponseType } from '../../../lambda/endpoints/booking/getUserBookings';

export const getUserBookingsQueryOptions = queryOptions({
    queryKey: ['user', 'bookings'],
    queryFn: fetchAfterUserQuery<TUserBookingsResponseType>('/api/user/bookings'),
    staleTime: 0,
    refetchOnWindowFocus: true,
  })

