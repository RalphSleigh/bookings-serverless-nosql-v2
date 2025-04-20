import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Navigate, redirect } from '@tanstack/react-router'
import { useContext } from 'react'

import { EventForm } from '../../../../components/event-form/form'
import { getEventsQueryOptions } from '../../../../queries/getEvents'
import { SnackBarContext } from '../../../../toasts'
import { editEventMuation } from '../../../../mutations/editEvent'

export const Route = createFileRoute('/_user/event/$eventId/edit')({
  beforeLoad: async ({ location, context }) => {
    if (context.permission.can('edit', 'event') === false)
      throw redirect({
        to: '/',
      })
  },
  component: EditEventComponent,
})

function EditEventComponent() {
  const { eventId } = Route.useParams()
  const { data } = useSuspenseQuery(getEventsQueryOptions)
  const snackbar = useContext(SnackBarContext)

  const event = data.events.find((event) => event.eventId === eventId)

  if (!event) {
    snackbar({
      message: `Event ${eventId} not found`,
      severity: 'error',
    })
    return <Navigate to="/" />
  }
  return <EventForm mode="edit" inputData={event} mutation={editEventMuation()} />
}
