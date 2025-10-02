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
import { getUserBookingsQueryOptions } from '../../../../../queries/geUserBookings'
import { useEvent } from '../../../../../utils'
import { PartialBookingType, TBooking } from '../../../../../../../shared/schemas/booking'
import { DefaultValues } from 'react-hook-form'

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
  const event = useEvent()
  const { permission, user } = Route.useRouteContext()

  const bookingsQuery = useSuspenseQuery(getUserBookingsQueryOptions)

  if (!event || !permission.can('book', subject('event', event))) {
    notifications.show({
      title: 'Error',
      message: `Event not found, or you don't have permission to book it`,
      color: 'red',
    })
    return <Navigate to="/" />
  }

  const inputData: DefaultValues<TBooking> & { userId: string; eventId: string } = { userId: user.userId, eventId: event.eventId, cancelled: false, basic: {}, people: [{ personId: uuidv7(), eventId: event.eventId, userId: user.userId, cancelled: false }] }

  const application = bookingsQuery.data?.applications.find((a) => a.eventId === event.eventId && a.userId === user.userId)
  if (event.applicationsRequired && application) {
    inputData.basic = { name: application.name, email: application.email, type: application.type }
    if(application.type === 'group' && application.district) {
      inputData.basic = {...inputData.basic, district: application.district}
    }
  } else {
    inputData.basic = { name: user.name, email: user.email }
  }

  return <BookingForm mode="create" event={event} inputData={inputData} mutation={createBookingMuation()} />
}
