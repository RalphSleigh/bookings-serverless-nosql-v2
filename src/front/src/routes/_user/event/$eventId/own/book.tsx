import { subject } from '@casl/ability'
import { notifications } from '@mantine/notifications'
import { IconArrowGuide } from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Navigate, redirect, useRouteContext } from '@tanstack/react-router'
import { useContext } from 'react'
import { v4 as uuidv4 } from 'uuid'

import { BookingForm } from '../../../../../components/booking-form/form'
import { EventForm } from '../../../../../components/event-form/form'
import { createBookingMuation } from '../../../../../mutations/createBooking'
import { getEventsQueryOptions } from '../../../../../queries/getEvents'

export const Route = createFileRoute('/_user/event/$eventId/own/book')({
  // Can't check this as we need the event object to check permissions
  /*   beforeLoad: async ({ location, context }) => {
    if (context.permission.can('edit', 'event') === false)
      throw redirect({
        to: '/',
      })
  }, */
  component: BookEventComponent,
})

function BookEventComponent() {
  const { eventId } = Route.useParams()
  const { permission, user } = Route.useRouteContext()
  const { data } = useSuspenseQuery(getEventsQueryOptions)
  const event = data.events.find((event) => event.eventId === eventId)

  if (!event || !permission.can('book', subject('event', event))) {
    notifications.show({
      title: 'Error',
      message: `Event ${eventId} not found, or you don't have permission to book it`,
      color: 'red',
    })
    return <Navigate to="/" />
  }
  return <BookingForm mode="create" event={event} inputData={{ userId: user.userId, eventId: event.eventId, cancelled: false, basic: {}, people: [{ personId: uuidv4(), eventId: event.eventId, userId: user.userId, cancelled: false }] }} mutation={createBookingMuation()} />
}
