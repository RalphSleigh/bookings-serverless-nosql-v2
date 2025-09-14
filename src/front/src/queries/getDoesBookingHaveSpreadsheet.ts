import { QueryFunctionContext, queryOptions, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { fetchAfterUserQuery } from './fetchAfterUser';
import { getEventsResponseType } from '../../../lambda/endpoints/event/getEvents';
import { TEvent } from '../../../shared/schemas/event';
import { TBookingHasSheetResponseType } from '../../../lambda/endpoints/booking/getBookingHasSheet';

export const getDoesBookingHaveSpreadsheet = (eventId:string, userId:string) => queryOptions({
    queryKey: ['event', eventId, 'sheet'],
    queryFn: fetchAfterUserQuery<TBookingHasSheetResponseType>(`/api/event/${eventId}/booking/${userId}/sheet`),
    staleTime: 0,
    refetchOnWindowFocus: true,
  })

