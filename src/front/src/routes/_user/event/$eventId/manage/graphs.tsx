import { subject } from '@casl/ability'
import { createFileRoute, redirect } from '@tanstack/react-router'

import { ManageGraphs } from '../../../../../components/manage/graphs'
import { getEventGraphDataQueryOptions } from '../../../../../queries/getEventGraphData'

//import { useSuspenseIfUser } from '../queries/useSuspenseWrapper'

export const Route = createFileRoute('/_user/event/$eventId/manage/graphs')({
  beforeLoad: async ({ params, context }) => {
    if (context.permission.can('getBackend', subject('eventId', { eventId: params.eventId })) === false)
      throw redirect({
        to: '/',
      })

    context.queryClient.prefetchQuery(getEventGraphDataQueryOptions(params.eventId))
  },
  component: ManageGraphs,
})
