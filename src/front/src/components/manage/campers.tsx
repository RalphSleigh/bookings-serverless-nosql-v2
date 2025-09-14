import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { MantineReactTable, MRT_ColumnDef, useMantineReactTable } from 'mantine-react-table'
import { useMemo, useState } from 'react'

import { TPerson } from '../../../../shared/schemas/person'
import { getEventBookingsQueryOptions } from '../../queries/getEventBookings'

import 'mantine-react-table/styles.css'

import { Box, Container, Modal, Paper, Text, Title } from '@mantine/core'
import dayjs from 'dayjs'
import useLocalStorageState from 'use-local-storage-state'

import { personFields } from '../../../../shared/personFields'
import { TEvent } from '../../../../shared/schemas/event'
import { ageGroupFromPerson } from '../../../../shared/woodcraft'
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

  const [selected, setSelected] = useState<string | undefined>(undefined)

  const table = useMantineReactTable({
    columns,
    data: campers, //must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    mantineTableProps: {
      className: styles.table,
    },
    state: { columnVisibility: columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    mantineTableBodyRowProps: ({ row }) => ({
      onClick: (event) => {
        setSelected(row.original.personId)
      },
    }),
  })

  const selectedPerson = campers.find((c) => c.personId === selected)

  return (
    <>
      <Modal opened={selectedPerson !== undefined} onClose={() => setSelected(undefined)} size="auto" withCloseButton={false}>
        <Modal.CloseButton style={{ float: 'right' }} />
        {selectedPerson !== undefined && <PersonDetails event={event} person={selectedPerson!} />}
      </Modal>
      <Container strategy="grid" fluid mt={8}>
        <Box data-breakout>
          <MantineReactTable table={table} />
        </Box>
      </Container>
    </>
  )
}

//initialState={{ columnVisibility: { address: false } }}

const PersonDetails = ({ event, person }: { event: TEvent; person: TPerson }) => {
  const age = dayjs(event.endDate).diff(dayjs(person.basic.dob), 'year')
  const group = ageGroupFromPerson(event)(person)
  return (
    <>
      <Title order={3}>{person.basic.name}</Title>
      <Text>
        {new Date(person.basic.dob).toLocaleDateString()} - {age < 21 ? `${group.singular} (${age})` : `${group.singular}`}
      </Text>
      {person.basic.email && (
        <Text>
          <a href={`mailto:${person.basic.email}`}>{person.basic.email}</a>
        </Text>
      )}
      <Text>{person.kp.diet}</Text>
      <Text>{person.kp.details}</Text>
      <Text>{person.health.medical}</Text>
    </>
  )
}
