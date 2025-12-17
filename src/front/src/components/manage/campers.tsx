import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { MantineReactTable, MRT_ColumnDef, MRT_Row, MRT_ShowHideColumnsButton, MRT_ToggleDensePaddingButton, MRT_ToggleFullScreenButton, useMantineReactTable } from 'mantine-react-table'
import { useMemo, useState } from 'react'

import { TPerson } from '../../../../shared/schemas/person'
import { getEventBookingsQueryOptions } from '../../queries/getEventBookings'

import 'mantine-react-table/styles.css'

import { ActionIcon, Box, Button, Container, Flex, Modal, Paper, Text, Title } from '@mantine/core'
import { IconDownload } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { download, generateCsv, mkConfig } from 'export-to-csv'
import useLocalStorageState from 'use-local-storage-state'

import { getAttendanceType } from '../../../../shared/attendance/attendance'
import { getKPType } from '../../../../shared/kp/kp'
import { personFields } from '../../../../shared/personFields'
import { TEvent } from '../../../../shared/schemas/event'
import { ageGroupFromPerson, ageGroups, campersInAgeGroup } from '../../../../shared/woodcraft'
import styles from '../../css/dataTable.module.css'
import { useEvent } from '../../utils'
import { TPersonResponse } from '../../../../lambda/endpoints/event/manage/getEventBookings'

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
      bookingsQuery.data.bookings.reduce<TPersonResponse[]>((acc, booking) => {
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
  const [columnSize, setColumnSize] = useLocalStorageState<{ [key: string]: number }>(`event-${eventId}-campers-column-size`, { defaultValue: {} })

  const columns = useMemo<MRT_ColumnDef<TPersonResponse>[]>(() => fields.map((f) => f.personTableDef()), [])

  const [selected, setSelected] = useState<string | undefined>(undefined)

  const handleExportRows = (rows: MRT_Row<TPersonResponse>[]) => {
    const rowData = rows.map((row) => row.original)
    const fields = personFields(event).filter((f) => f.enabled(event) && f.enabledForDrive(event))
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
      filename: `campers-${event.name}-${dayjs().format('YYYY-MM-DD')}`,
    })

    const csv = generateCsv(csvConfig)(data)
    download(csvConfig)(csv)
  }

  const totals = ageGroups.map((ag) => {
    const campersInGroup = campersInAgeGroup(event)(ag)
    const count = campers.filter(campersInGroup).length
    if (count === 0) {
      return null
    }
    const agInstance = ag.construct(0);
    return `${agInstance.plural}: ${count}`; 
  })
  .filter((s) => s !== null)
  .join(', ');

  const table = useMantineReactTable({
    columns,
    data: campers, //must be memoized or stable (useState, useMemo, defined outside of this component, etc.)
    mantineTableProps: {
      className: styles.table,
    },
    state: { columnVisibility: columnVisibility, columnSizing: columnSize },
    onColumnVisibilityChange: setColumnVisibility,
    mantineTableBodyRowProps: ({ row }) => ({
      onClick: (event) => {
        setSelected(row.original.personId)
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
    enableColumnResizing: true,
    onColumnSizingChange: setColumnSize,
    layoutMode: 'grid',
    initialState: { density: 'xs', pagination: { pageSize: 100, pageIndex: 0 } },
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
          <Text mt={4} mb={4}><b>Total: {campers.length}</b>, {totals}</Text>
          <MantineReactTable table={table} />
        </Box>
      </Container>
    </>
  )
}

//initialState={{ columnVisibility: { address: false } }}

const PersonDetails = ({ event, person }: { event: TEvent; person: TPersonResponse }) => {
  const age = dayjs(event.endDate).diff(dayjs(person.basic.dob), 'year')
  const group = ageGroupFromPerson(event)(person)
  const kp = getKPType(event)
  const attendance = getAttendanceType(event)
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
      {'kp' in person && <kp.PersonCardSection person={person} />}
      <attendance.PersonCardElement event={event} person={person} />
      {'health' in person && <Text>{person.health.medical}</Text>}
    </>
  )
}
