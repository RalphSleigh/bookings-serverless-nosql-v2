import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { MantineReactTable, MRT_ColumnDef, MRT_Row, MRT_ToggleDensePaddingButton, MRT_ToggleFullScreenButton, useMantineReactTable } from 'mantine-react-table'
import { useMemo, useState } from 'react'

import { TPerson } from '../../../../shared/schemas/person'
import { getEventBookingsQueryOptions } from '../../queries/getEventBookings'

import 'mantine-react-table/styles.css'

import { ActionIcon, Box, Container, Flex, Modal, Paper, Text, Title } from '@mantine/core'
import dayjs from 'dayjs'
import useLocalStorageState from 'use-local-storage-state'

import { bookingFields } from '../../../../shared/bookingFields'
import { TEvent } from '../../../../shared/schemas/event'
import { ageGroupFromPerson } from '../../../../shared/woodcraft'
import styles from '../../css/dataTable.module.css'
import { CustomLink, useEvent } from '../../utils'
import { TBooking } from '../../../../shared/schemas/booking'
import { download, generateCsv, mkConfig } from 'export-to-csv'
import { IconDownload } from '@tabler/icons-react'

export const ManageBookings = () => {
  const route = getRouteApi('/_user/event/$eventId/manage')
  const { eventId } = route.useParams()
  const bookingsQuery = useSuspenseQuery(getEventBookingsQueryOptions(eventId))
  const event = useEvent()

  const fields = useMemo(() => bookingFields(event).filter((f) => f.enabled(event)), [])
  const visibilityDefault = fields.reduce(
    (acc, f) => {
      acc[f.name] = !f.hideByDefault
      return acc
    },
    {} as Record<string, boolean>,
  )

  const bookings = useMemo(() => bookingsQuery.data.bookings, [bookingsQuery.data])

  const [columnVisibility, setColumnVisibility] = useLocalStorageState(`event-${eventId}-booking-column-visibility-default`, { defaultValue: visibilityDefault })

  const columns = useMemo<MRT_ColumnDef<TBooking>[]>(() => fields.map((f) => f.bookingTableDef()), [])

  const [selected, setSelected] = useState<string | undefined>(undefined)

  const handleExportRows = (rows: MRT_Row<TBooking>[]) => {
    const rowData = rows.map((row) => row.original)
    const fields = bookingFields(event).filter((f) => f.enabled(event) && f.enabledForDrive(event))
    const columnNames = fields.map((f) => f.titleForDrive())
    let data = rowData.map((row) => {
      return fields.reduce(
        (acc, f) => {
          acc[f.name] = f.valueForDrive(row)
          return acc
        },
        {} as Record<string, string>,
      )
    })

    const csvConfig = mkConfig({
      fieldSeparator: ',',
      decimalSeparator: '.',
      useKeysAsHeaders: true,
      filename: `bookings-${event.name}-${dayjs().format('YYYY-MM-DD')}`,
    })

    const csv = generateCsv(csvConfig)(data)
    download(csvConfig)(csv)
  }

  const table = useMantineReactTable({
    columns,
    data: bookings, //must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    mantineTableProps: {
      className: styles.table,
    },
    state: { columnVisibility: columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    mantineTableBodyRowProps: ({ row }) => ({
      onClick: (event) => {
        setSelected(row.original.userId)
      },
    }),
    renderToolbarInternalActions: ({ table }) => (
      <Flex gap="xs" align="center">
        {/* add custom button to print table  */}
        <ActionIcon variant="subtle" color="gray" onClick={() => handleExportRows(table.getPrePaginationRowModel().rows)}>
          <IconDownload />
        </ActionIcon>
        {/* along-side built-in buttons in whatever order you want them */}
        <MRT_ToggleDensePaddingButton table={table} />
        <MRT_ToggleFullScreenButton table={table} />
      </Flex>
    ),
  })

  const selectedBooking = bookings.find((b) => b.userId === selected)

  return (
    <>
      <Modal opened={selectedBooking !== undefined} onClose={() => setSelected(undefined)} size="auto" withCloseButton={false}>
        <Modal.CloseButton style={{ float: 'right' }} />
        {selectedBooking !== undefined && <BookingDetails event={event} booking={selectedBooking!} />}
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

const BookingDetails = ({ event, booking }: { event: TEvent; booking: TBooking }) => {
  return (
    <>
    <CustomLink to={`/event/$eventId/manage/booking/$userId/history`} params={{ eventId: event.eventId, userId: booking.userId }} style={{ float: 'right', marginTop: 10, marginRight: 10 }}>
                History
              </CustomLink>
      {/*
      { <Title order={3}>{person.basic.name}</Title>
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
    </> */}
    </>
  )
}
