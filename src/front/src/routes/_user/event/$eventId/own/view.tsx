import { notifications } from '@mantine/notifications'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Navigate } from '@tanstack/react-router'

import { BookingForm } from '../../../../../components/booking-form/form'
import { dummyMutation } from '../../../../../mutations/dummyMutation'
import { getUserBookingsQueryOptions } from '../../../../../queries/getUserBookings'
import { useEvent } from '../../../../../utils'

export const Route = createFileRoute('/_user/event/$eventId/own/view')({
  // Can't check this as we need the event object to check permissions
  /*   beforeLoad: async ({ location, context }) => {
    if (context.permission.can('edit', 'event') === false)
      throw redirect({
        to: '/',
      })
  }, */
  component: ViewBookingComponent,
})

function ViewBookingComponent() {
  const { permission, user } = Route.useRouteContext()

  const bookingsQuery = useSuspenseQuery(getUserBookingsQueryOptions)

  const event = useEvent()
  const booking = bookingsQuery.data.bookings.find((booking) => booking.eventId === event.eventId && booking.userId === user.userId)
  const application = bookingsQuery.data?.applications.find((a) => a.eventId === event.eventId && a.userId === user.userId)

  const fees = bookingsQuery.data?.fees.filter((f) => f.eventId === event.eventId && f.userId === user.userId) || []

  if (!event || !booking || !permission.can('get', 'ownBookings')) {
    notifications.show({
      title: 'Error',
      message: `Booking not found, or you don't have permission to view it`,
      color: 'red',
    })
    return <Navigate to="/" />
  }
  return <BookingForm mode={'view'} event={event} inputData={booking} mutation={dummyMutation()} payments={fees} application={application} />
}
