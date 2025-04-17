import { QueryFunctionContext, queryOptions, useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { fetchAfterUserQuery } from './fetchAfterUser';
import { getEventsResponseType } from '../../../lambda/endpoints/event/getEvents';

export const getEventsQueryOptions = queryOptions({
    queryKey: ['events'],
    queryFn: fetchAfterUserQuery<getEventsResponseType>('/api/events'),
    staleTime: 0,
    refetchOnWindowFocus: true,
  })

