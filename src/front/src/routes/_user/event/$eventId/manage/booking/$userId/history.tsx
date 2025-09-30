import { subject } from '@casl/ability'
import { createFileRoute, redirect } from '@tanstack/react-router'

import { ManageBookings } from '../../../../../../../components/manage/bookings'
import { getEventBookingHistoryQueryOptions } from '../../../../../../../queries/getEventBookingHistory'
import { ManageBookingHistory } from '../../../../../../../components/manage/bookingHistory'

//import { useSuspenseIfUser } from '../queries/useSuspenseWrapper'

export const Route = createFileRoute('/_user/event/$eventId/manage/booking/$userId/history')({
  beforeLoad: async ({ params, context }) => {
    if (context.permission.can('getBackend', subject('eventId', { eventId: params.eventId })) === false)
      throw redirect({
        to: '/',
      })

    context.queryClient.prefetchQuery(getEventBookingHistoryQueryOptions(params.eventId, params.userId))
  },
  component: ManageBookingHistory,
})
