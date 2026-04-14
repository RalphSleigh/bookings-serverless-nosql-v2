import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi, useRouteContext } from '@tanstack/react-router'
import { MantineReactTable, MRT_ColumnDef, MRT_Row, MRT_ShowHideColumnsButton, MRT_ToggleDensePaddingButton, MRT_ToggleFullScreenButton, useMantineReactTable } from 'mantine-react-table'
import { JSX, useMemo, useState } from 'react'

import { TPerson } from '../../../../shared/schemas/person'
import { getEventBookingsQueryOptions } from '../../queries/getEventBookings'

import 'mantine-react-table/styles.css'

import { ActionIcon, Box, Button, Container, Flex, Modal, Paper, Table, Text, Title } from '@mantine/core'
import { IconDownload } from '@tabler/icons-react'
import dayjs from 'dayjs'
import { download, generateCsv, mkConfig } from 'export-to-csv'
import useLocalStorageState from 'use-local-storage-state'

import { TBookingResponse, TPersonResponse } from '../../../../lambda/endpoints/event/manage/getEventBookings'
import { getAttendanceType } from '../../../../shared/attendance/attendance'
import { getKPType } from '../../../../shared/kp/kp'
import { personFields } from '../../../../shared/personFields'
import { TBooking } from '../../../../shared/schemas/booking'
import { TEvent } from '../../../../shared/schemas/event'
import { ageGroupFromPerson, ageGroups, campersInAgeGroup } from '../../../../shared/woodcraft'
import styles from '../../css/dataTable.module.css'
import { useEvent } from '../../utils'

export const ManageComms = () => {
  const route = getRouteApi('/_user/event/$eventId/manage')
  const { user } = useRouteContext({ from: '/_user' })
  const { eventId } = route.useParams()
  const bookingsQuery = useSuspenseQuery(getEventBookingsQueryOptions(eventId))
  const event = useEvent()

  const rows = bookingsQuery.data.bookings.reduce((acc, booking) => {
    const extraComms = (booking.extraContacts || []).map((c, i) => {
      return (
        <Table.Tr key={booking.userId + '-extra-' + i}>
          <Table.Td></Table.Td>
          <Table.Td>{c.name}</Table.Td>
          <Table.Td>
            <a href={`mailto:${c.email}`} target="_blank">
              {c.email}
            </a>
          </Table.Td>
        </Table.Tr>
      )
    })

    const row = (
      <Table.Tr key={booking.userId}>
        <Table.Td>{'type' in booking.basic && booking.basic.type === 'group' ? booking.basic.district : 'Individual'}</Table.Td>
        <Table.Td>{booking.basic.name}</Table.Td>
        <Table.Td>
          <a href={`mailto:${booking.basic.email}`} target="_blank">
            {booking.basic.email}
          </a>
        </Table.Td>
      </Table.Tr>
    )
    return [...acc, row, ...extraComms]
  }, [] as JSX.Element[])

  const mailAllLink = `mailto:?bcc=${bookingsQuery.data.bookings
    .map((b) => [b.basic.email, ...(b.extraContacts || []).map((c) => c.email)])
    .flat()
    .join(',')}`

  return (
    <>
      <Container strategy="grid" fluid mt={8}>
        <Box data-breakout>
          <Text ml={8}>This table contains the primary booking contact and any extra contacts they have supplied</Text>
          <Text mb={8} ml={8}>
            Email all addresses:{' '}
            <a href={mailAllLink} target="_blank">
              Link
            </a>
          </Text>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>District</Table.Th>
                <Table.Th>Name</Table.Th>
                <Table.Th>Email</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>{rows}</Table.Tbody>
          </Table>
        </Box>
      </Container>
    </>
  )
}
