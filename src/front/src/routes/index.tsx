import { ActionIcon, Flex } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, Link, redirect, useRouteContext } from '@tanstack/react-router'
import * as React from 'react'

import { EventList } from '../components/eventList'
import { Can } from '../permissionContext'
import { getEventsQueryOptions } from '../queries/getEvents'
import { getUserBookingsQueryOptions } from '../queries/geUserBookings'

//import { useSuspenseIfUser } from '../queries/useSuspenseWrapper'

export const Route = createFileRoute('/')({
  component: HomeComponent,
})

function HomeComponent() {
  const eventsQuery = useSuspenseQuery(getEventsQueryOptions)
  const bookingsQuery = useSuspenseQuery(getUserBookingsQueryOptions)
  return (
    <>
      <EventList events={eventsQuery.data.events} bookings={bookingsQuery.data.bookings}/>
      <Flex justify="flex-end" p={16}>
      <Can I="create" a="event">
        <Link to="/events/new">
          <ActionIcon variant="filled" color="red" size="xl" radius="xl" aria-label="Settings">
            <IconPlus style={{ width: '70%', height: '70%' }} stroke={1.5} />
          </ActionIcon>
        </Link>
      </Can>
      </Flex>
    </>
  )
}
