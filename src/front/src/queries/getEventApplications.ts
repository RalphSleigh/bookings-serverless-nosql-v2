import { queryOptions } from '@tanstack/react-query'
import { fetchAfterUserQuery } from './fetchAfterUser';
import { GetEventApplicationsResponseType } from '../../../lambda/endpoints/event/manage/getEventApplications';

export const getEventApplicationsQueryOptions = (eventId: string) => queryOptions({
    queryKey: ['event', eventId, 'applications'],
    queryFn: fetchAfterUserQuery<GetEventApplicationsResponseType>(`/api/event/${eventId}/manage/applications   `),
    staleTime: 0,
    refetchOnWindowFocus: true,
  })

