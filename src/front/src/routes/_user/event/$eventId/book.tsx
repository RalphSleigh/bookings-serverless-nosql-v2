import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Navigate, redirect, useRouteContext } from '@tanstack/react-router'
import { useContext } from 'react'

import { EventForm } from '../../../../components/event-form/form'
import { getEventsQueryOptions } from '../../../../queries/getEvents'
import { editEventMuation } from '../../../../mutations/editEvent'
import { notifications } from '@mantine/notifications'
import { subject } from '@casl/ability'
import { BookingForm } from '../../../../components/booking-form/form'

export const Route = createFileRoute('/_user/event/$eventId/book')({
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

  if(!event || !permission.can('book', subject('event', event))) {
    notifications.show({
      title: 'Error',
      message: `Event ${eventId} not found, or you don't have permission to book it`,
      color: 'red',
    })
    return <Navigate to="/" />
  }
  return <BookingForm mode="create" event={event} inputData={{userId:user.userId, basic: {}, people:[{}]}} /* mutation={editEventMuation()} */ />
}
