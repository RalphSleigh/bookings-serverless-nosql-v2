import { subject } from '@casl/ability'
import { notifications } from '@mantine/notifications'
import { IconArrowGuide } from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Navigate, redirect, useRouteContext } from '@tanstack/react-router'
import { useContext } from 'react'
import { v7 as uuidv7 } from 'uuid'

import { BookingForm } from '../../../../../components/booking-form/form'
import { EventForm } from '../../../../../components/event-form/form'
import { createBookingMuation } from '../../../../../mutations/createBooking'
import { getEventsQueryOptions } from '../../../../../queries/getEvents'
import { useEvent } from '../../../../../utils'
import { ApplicationForm } from '../../../../../components/application-form/appplicationForm'

export const Route = createFileRoute('/_user/event/$eventId/own/apply')({
  // Can't check this as we need the event object to check permissions
  /*   beforeLoad: async ({ location, context }) => {
    if (context.permission.can('edit', 'event') === false)
      throw redirect({
        to: '/',
      })
  }, */
  component: ApplyToEventComponent,
})

function ApplyToEventComponent() {
  const event = useEvent()
  const { permission, user } = Route.useRouteContext()

  if (!event || !permission.can('apply', subject('event', event))) {
    notifications.show({
      title: 'Error',
      message: `Event not found, or you don't have permission to apply for it`,
      color: 'red',
    })
    return <Navigate to="/" />
  }
  return (
    <ApplicationForm/>
  )
}
