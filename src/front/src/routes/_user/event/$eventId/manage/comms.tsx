import { subject } from '@casl/ability'
import { createFileRoute, redirect } from '@tanstack/react-router'

import { getEventGraphDataQueryOptions } from '../../../../../queries/getEventGraphData'
import { ManageComms } from '../../../../../components/manage/comms'

//import { useSuspenseIfUser } from '../queries/useSuspenseWrapper'

export const Route = createFileRoute('/_user/event/$eventId/manage/comms')({
  beforeLoad: async ({ params, context }) => {
    if (context.permission.can('getBackend', subject('eventId', { eventId: params.eventId })) === false)
      throw redirect({
        to: '/',
      })

    context.queryClient.prefetchQuery(getEventGraphDataQueryOptions(params.eventId))
  },
  component: ManageComms,
})
