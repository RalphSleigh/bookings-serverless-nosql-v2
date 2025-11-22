import { subject } from '@casl/ability'
import { notifications } from '@mantine/notifications'
import { IconArrowGuide } from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Navigate, redirect, useRouteContext } from '@tanstack/react-router'

import { BookingForm } from '../../../../../components/booking-form/form'
import { updateBookingMuation } from '../../../../../mutations/updateBooking'
import { getEventsQueryOptions } from '../../../../../queries/getEvents'
import { getUserBookingsQueryOptions } from '../../../../../queries/geUserBookings'
import { useEvent } from '../../../../../utils'

export const Route = createFileRoute('/_user/event/$eventId/own/update')({
  // Can't check this as we need the event object to check permissions
  /*   beforeLoad: async ({ location, context }) => {
    if (context.permission.can('edit', 'event') === false)
      throw redirect({
        to: '/',
      })
  }, */
  component: EditBookingComponent,
})

function EditBookingComponent() {
  const { permission, user } = Route.useRouteContext()

  const bookingsQuery = useSuspenseQuery(getUserBookingsQueryOptions)

  const event = useEvent()
  const booking = bookingsQuery.data.bookings.find((booking) => booking.eventId === event.eventId && booking.userId === user.userId)

  const fees = bookingsQuery.data?.fees.filter((f) => f.eventId === event.eventId && f.userId === user.userId) || []

  if (!event || !booking || !permission.can('update', subject('eventBooking', { event, booking }))) {
    notifications.show({
      title: 'Error',
      message: `Event  not found, or you don't have permission to book it`,
      color: 'red',
    })
    return <Navigate to="/" />
  }
  return <BookingForm mode={booking.cancelled ? 'rebook' : 'edit'} event={event} inputData={booking} mutation={updateBookingMuation()} payments={fees} />
}
