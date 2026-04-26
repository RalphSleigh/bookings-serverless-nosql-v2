import { queryOptions } from '@tanstack/react-query'

import { GetApplicationSheetNumbersResponseType } from '../../../lambda/endpoints/event/manage/getApplicationSheetNumbers'
import { fetchAfterUserQuery } from './fetchAfterUser'

export const getEventApplicationSheetNumbersQueryOptions = (eventId: string) =>
  queryOptions({
    queryKey: ['event', eventId, 'applicationSheetNumbers'],
    queryFn: fetchAfterUserQuery<GetApplicationSheetNumbersResponseType>(`/api/event/${eventId}/manage/applicationSheetNumbers`),
    staleTime: 0,
    refetchOnWindowFocus: true,
  })
