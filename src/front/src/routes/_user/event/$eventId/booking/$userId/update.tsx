import { subject } from '@casl/ability'
import { notifications } from '@mantine/notifications'
import { IconArrowGuide } from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Navigate, redirect, useRouteContext } from '@tanstack/react-router'

import { getEventBookingsQueryOptions } from '../../../../../../queries/getEventBookings'
import { useEvent } from '../../../../../../utils'
import { BookingForm } from '../../../../../../components/booking-form/form'
import { updateBookingMuation } from '../../../../../../mutations/updateBooking'

export const Route = createFileRoute('/_user/event/$eventId/booking/$userId/update')({
  // Can't check this as we need the event object to check permissions
  beforeLoad: async ({ params, context }) => {
    context.queryClient.prefetchQuery(getEventBookingsQueryOptions(params.eventId))
  },
  component: EditBookingComponent,
})

function EditBookingComponent() {
  const { permission, user } = Route.useRouteContext()
  const params = Route.useParams()

  const event = useEvent()

  const bookingsQuery = useSuspenseQuery(getEventBookingsQueryOptions(event.eventId))

  const booking = bookingsQuery.data.bookings.find((booking) => booking.eventId === event.eventId && booking.userId === params.userId)

  if (!event || !booking || !permission.can('update', subject('eventBooking', { event, booking }))) {
    notifications.show({
      title: 'Error',
      message: `Event  not found, or you don't have permission to book it`,
      color: 'red',
    })
    return <Navigate to="/" />
  }
  return <BookingForm mode={booking.cancelled ? 'rebook' : 'edit'} event={event} inputData={booking} mutation={updateBookingMuation()} />
}
