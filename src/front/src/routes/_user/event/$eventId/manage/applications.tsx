import { subject } from '@casl/ability'
import { createFileRoute, Link, redirect, useRouteContext } from '@tanstack/react-router'

import { ManageApplications } from '../../../../../components/manage/applications'
import { getEventApplicationsQueryOptions } from '../../../../../queries/getEventApplications'

export const Route = createFileRoute('/_user/event/$eventId/manage/applications')({
  beforeLoad: async ({ params, context }) => {
    if (context.permission.can('getApplications', subject('eventId', { eventId: params.eventId })) === false)
      throw redirect({
        to: '/',
      })

    context.queryClient.prefetchQuery(getEventApplicationsQueryOptions(params.eventId))
  },
  component: ManageApplications,
})
