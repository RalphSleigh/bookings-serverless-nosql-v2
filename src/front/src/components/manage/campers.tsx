import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { MantineReactTable, MRT_ColumnDef, useMantineReactTable } from 'mantine-react-table'
import { useMemo } from 'react'

import { TPerson } from '../../../../shared/schemas/person'
import { getEventBookingsQueryOptions } from '../../queries/getEventBookings'

import 'mantine-react-table/styles.css'

import { Box, Container, Paper } from '@mantine/core'
import useLocalStorageState from 'use-local-storage-state'

import { personFields } from '../../../../shared/personFields'
import styles from '../../css/dataTable.module.css'
import { useEvent } from '../../utils'

export const ManageCampers = () => {
  const route = getRouteApi('/_user/event/$eventId/manage')
  const { eventId } = route.useParams()
  const bookingsQuery = useSuspenseQuery(getEventBookingsQueryOptions(eventId))
  const event = useEvent()

  const bookings = bookingsQuery.data.bookings.map((b) => (
    <div key={b.userId}>
      <p>{b.basic.name}</p>
    </div>
  ))

  const campers = useMemo(
    () =>
      bookingsQuery.data.bookings.reduce<TPerson[]>((acc, booking) => {
        return [...acc, ...booking.people]
      }, []),
    [bookingsQuery.data],
  )

  const fields = useMemo(() => personFields(event).filter((f) => f.enabled(event)), [])
  const visibilityDefault = fields.reduce(
    (acc, f) => {
      acc[f.name] = !f.hideByDefault
      return acc
    },
    {} as Record<string, boolean>,
  )

  const [columnVisibility, setColumnVisibility] = useLocalStorageState(`event-${eventId}-campers-column-visibility-default`, { defaultValue: visibilityDefault })

  const columns = useMemo<MRT_ColumnDef<TPerson>[]>(() => fields.map((f) => f.personTableDef()), [])

  const table = useMantineReactTable({
    columns,
    data: campers, //must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    mantineTableProps: {
      className: styles.table,
    },
    state: { columnVisibility: columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
  })

  return (
    <Container strategy="grid" fluid mt={8}>
      <Box data-breakout>
        <MantineReactTable table={table} />
      </Box>
    </Container>
  )
}

//initialState={{ columnVisibility: { address: false } }}
