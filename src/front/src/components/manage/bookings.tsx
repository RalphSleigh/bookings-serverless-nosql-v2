import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { MantineReactTable, MRT_ColumnDef, MRT_Row, MRT_ShowHideColumnsButton, MRT_ToggleDensePaddingButton, MRT_ToggleFullScreenButton, useMantineReactTable } from 'mantine-react-table'
import { useMemo, useState } from 'react'

import { TPerson } from '../../../../shared/schemas/person'
import { getEventBookingsQueryOptions } from '../../queries/getEventBookings'

import 'mantine-react-table/styles.css'

import { subject } from '@casl/ability'
import { ActionIcon, Anchor, Box, Container, Flex, Modal, Paper, ScrollArea, Stack, Text, Title } from '@mantine/core'
import { IconDownload } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { download, generateCsv, mkConfig } from 'export-to-csv'
import useLocalStorageState from 'use-local-storage-state'

import { TBookingResponse } from '../../../../lambda/endpoints/event/manage/getEventBookings'
import { bookingFields } from '../../../../shared/bookingFields'
import { TBooking } from '../../../../shared/schemas/booking'
import { TEvent } from '../../../../shared/schemas/event'
import { ageGroupFromPerson } from '../../../../shared/woodcraft'
import styles from '../../css/dataTable.module.css'
import { CustomLink, useEvent } from '../../utils'
import { Can } from '../../permissionContext'

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

  const columns = useMemo<MRT_ColumnDef<TBookingResponse>[]>(() => fields.map((f) => f.bookingTableDef()), [])

  const [selected, setSelected] = useState<string | undefined>(undefined)

  const handleExportRows = (rows: MRT_Row<TBookingResponse>[]) => {
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
        <MRT_ShowHideColumnsButton table={table} />
        <MRT_ToggleDensePaddingButton table={table} />
        <MRT_ToggleFullScreenButton table={table} />
      </Flex>
    ),
    initialState: { density: 'xs', pagination: { pageSize: 100, pageIndex: 0 } },
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

const basicDetailsSmall = (event: TEvent, booking: TBookingResponse) => (
  <>
    <Title order={4}>{booking.basic.name}</Title>
    <Text>
      <b>Email:</b> <Anchor href={`mailto:${booking.basic.email}`}>{booking.basic.email}</Anchor>
    </Text>
    <Text>
      <b>Phone:</b> <Anchor href={`tel:${booking.basic.telephone}`}>{booking.basic.telephone}</Anchor>
    </Text>
  </>
)

const basicDetailsLargeIndvidual = (event: TEvent, booking: TBookingResponse) => (
  <>
    <Title order={4}>{booking.basic.name}&nbsp;-&nbsp;Indvidiual</Title>
    {'district' in booking.basic ? (
      <Text>
        <b>District:</b> {booking.basic.district}
      </Text>
    ) : null}
    <Text>
      <b>Email:</b> <Anchor href={`mailto:${booking.basic.email}`}>{booking.basic.email}</Anchor>
    </Text>
    <Text>
      <b>Phone:</b> <Anchor href={`tel:${booking.basic.telephone}`}>{booking.basic.telephone}</Anchor>
    </Text>
  </>
)

const basicDetailsLargeGroup = (event: TEvent, booking: TBookingResponse) => (
  <>
    <Title order={4}>{booking.basic.name}&nbsp;-&nbsp;Group</Title>
    {'district' in booking.basic ? (
      <Text>
        <b>District:</b> {booking.basic.district}
      </Text>
    ) : null}
    <Text>
      <b>Email:</b> <Anchor href={`mailto:${booking.basic.email}`}>{booking.basic.email}</Anchor>
    </Text>
    <Text>
      <b>Phone:</b> <Anchor href={`tel:${booking.basic.telephone}`}>{booking.basic.telephone}</Anchor>
    </Text>
  </>
)

const campingDetailsLarge = (event: TEvent, booking: TBookingResponse) => (
  <>
    <Title order={4}>Camping Details</Title>
    <Text>
      <b>Shuttle:</b> {'shuttle' in booking.other ? booking.other.shuttle : 'N/A'}
    </Text>
    <Text>
      <b>Anything else:</b> {booking.other.anythingElse}
    </Text>
  </>
)

const campingDetailsSmall = (event: TEvent, booking: TBookingResponse) => (
  <>
    <Title order={4}>Camping Details</Title>
    <Text>
      <b>WhatsApp:</b> {'whatsApp' in booking.other ? booking.other.whatsApp : 'N/A'}
    </Text>
    <Text>
      <b>Anything else:</b> {booking.other.anythingElse}
    </Text>
  </>
)

const BookingDetails = ({ event, booking }: { event: TEvent; booking: TBookingResponse }) => {
  const basic = event.bigCampMode
    ? 'type' in booking.basic && booking.basic.type === 'individual'
      ? basicDetailsLargeIndvidual(event, booking)
      : basicDetailsLargeGroup(event, booking)
    : basicDetailsSmall(event, booking)

  const camping = event.bigCampMode ? campingDetailsLarge(event, booking) : campingDetailsSmall(event, booking)

  const peopleList = booking.people.map((p) => <li key={p.personId}>{p.basic.name}</li>)

  return (
    <Flex>
      <Box>
        {basic}
        {camping}
        <Text>
          <b>Booked:</b> {booking.people.length}
        </Text>
        <Can I="getSensitiveFields" this={subject('eventId', { eventId: event.eventId })}>
          <CustomLink to={`/event/$eventId/manage/booking/$userId/history`} params={{ eventId: event.eventId, userId: booking.userId }} style={{ float: 'right', marginTop: 10, marginRight: 10 }}>
            History
          </CustomLink>
        </Can>
      </Box>
      <Box h="calc(100dvh - var(--modal-y-offset) * 2 - var(--mantine-spacing-md) * 2)">
        <Stack h="100%" gap={0}>
          <ScrollArea pr={16}>
            <ul>{peopleList}</ul>
          </ScrollArea>
        </Stack>
      </Box>
    </Flex>
  )
}
