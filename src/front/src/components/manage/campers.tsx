import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { MantineReactTable, MRT_ColumnDef, useMantineReactTable } from 'mantine-react-table'
import { useMemo } from 'react'

import { TPerson } from '../../../../shared/schemas/person'
import { getEventBookingsQueryOptions } from '../../queries/getEventBookings'

import 'mantine-react-table/styles.css';
import { Container, Paper } from '@mantine/core'

export const ManageCampers = () => {
  const route = getRouteApi('/_user/event/$eventId/manage')
  const { eventId } = route.useParams()
  const bookingsQuery = useSuspenseQuery(getEventBookingsQueryOptions(eventId))

  const bookings = bookingsQuery.data.bookings.map((b) => (
    <div key={b.userId}>
      <p>{b.basic.name}</p>
    </div>
  ))

  const campers = useMemo(() => bookingsQuery.data.bookings.reduce<TPerson[]>((acc, booking) => {
    return [...acc, ...booking.people]
  }, []), [bookingsQuery.data])

  const columns = useMemo<MRT_ColumnDef<TPerson>[]>(
    () => [
      {
        accessorKey: 'basic.name', //access nested data with dot notation
        header: 'Name',
      },

      {
        accessorKey: 'basic.email',
        header: 'Email',
      },

      {
        accessorKey: 'basic.dob', //normal accessorKey
        header: 'DoB',
      },
    ],
    [],
  )

  const table = useMantineReactTable({
    columns,
    data: campers, //must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
  })

  return (
    <Container strategy="grid" fluid>
      <Paper data-breakout shadow="md" radius="md" withBorder m={8} p="md">
        <MantineReactTable table={table} />
      </Paper>
    </Container>
  )
}
