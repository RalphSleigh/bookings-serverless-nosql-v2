import { ActionIcon, Avatar, Box, Button, Container, Flex, Grid, Modal, NumberInput, Overlay, Paper, Table, Text, TextInput, Title, Transition } from '@mantine/core'
import { IconCheck, IconCurrencyPound, IconX } from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'

import { TApplication } from '../../../../shared/schemas/application'
import { TEvent } from '../../../../shared/schemas/event'
import { approveApplicationMutation } from '../../mutations/approveApplication'
import { declineApplicationMutation } from '../../mutations/declineApplication'
import { getEventApplicationsQueryOptions } from '../../queries/getEventApplications'
import { getEventBookingsQueryOptions } from '../../queries/getEventBookings'
import { useEvent } from '../../utils'

export const ManageApplications = () => {
  const route = getRouteApi('/_user/event/$eventId/manage')
  const event = useEvent()
  const { eventId } = event
  const applicationsQuery = useSuspenseQuery(getEventApplicationsQueryOptions(eventId))
  const bookingsQuery = useSuspenseQuery(getEventBookingsQueryOptions(eventId))

  const bookings = useMemo(() => bookingsQuery.data.bookings, [bookingsQuery.data])

  const pending = useMemo(() => applicationsQuery.data.applications.filter((a) => a.status === 'pending').sort((a, b) => b.createdAt - a.createdAt), [applicationsQuery.data])

  const pendingRows = pending.map((app) => (
    <Table.Tr key={app.userId}>
      <Table.Td>{Avatars(app.type)}</Table.Td>
      <Table.Td>{app.name}</Table.Td>
      <Table.Td>
        <a href={`mailto:${app.email}`}>{app.email}</a>
      </Table.Td>
      <Table.Td>{app.district}</Table.Td>
      <Table.Td>{app.predicted}</Table.Td>
      <Table.Td>{dayjs(app.createdAt).format('DD/MM/YYYY')}</Table.Td>
      <Table.Td>
        <Flex gap={8}>
          <ApproveButton event={event} application={app} />
          <DeclineButton event={event} application={app} />
        </Flex>
      </Table.Td>
    </Table.Tr>
  ))

  const approved = useMemo(() => applicationsQuery.data.applications.filter((a) => a.status === 'approved').sort((a, b) => b.createdAt - a.createdAt), [applicationsQuery.data])

  const approvedRows = approved.map((app) => {
    const booking = bookings.find((b) => b.userId === app.userId)
    return (
      <Table.Tr key={app.userId}>
        <Table.Td>{Avatars(app.type)}</Table.Td>
        <Table.Td>
          <a href={`mailto:${app.email}`}>{app.email}</a>
        </Table.Td>
        <Table.Td>{app.email}</Table.Td>
        <Table.Td>{app.district}</Table.Td>
        <Table.Td>{app.predicted}</Table.Td>
        <Table.Td>{booking ? booking.people.length : ''}</Table.Td>
        <Table.Td>
          <Flex gap={8}>
            <DeclineButton event={event} application={app} />
          </Flex>
        </Table.Td>
      </Table.Tr>
    )
  })

  const totalApproved = approved.reduce((a, c) => {
    const booking = bookings.find((b) => b.userId === c.userId)
    return booking && booking.people.length > c.predicted ? a + booking.people.length : a + c.predicted
  }, 0)

  const declined = useMemo(() => applicationsQuery.data.applications.filter((a) => a.status === 'declined').sort((a, b) => b.createdAt - a.createdAt), [applicationsQuery.data])
  const declinedRows = declined.map((app) => (
    <Table.Tr key={app.userId}>
      <Table.Td>{Avatars(app.type)}</Table.Td>
      <Table.Td>{app.name}</Table.Td>

      <Table.Td>
        <a href={`mailto:${app.email}`}>{app.email}</a>
      </Table.Td>
      <Table.Td>{app.district}</Table.Td>
      <Table.Td>{app.predicted}</Table.Td>
      <Table.Td>{dayjs(app.createdAt).format('DD/MM/YYYY')}</Table.Td>
      <Table.Td>
        <Flex gap={8}>
          <ApproveButton event={event} application={app} />
        </Flex>
      </Table.Td>
    </Table.Tr>
  ))

  return (
    <Container strategy="grid" fluid>
      <Title order={3} mt={16}>
        Applications for {event.name}
      </Title>
      <Title order={5} mt={16} mb={16}>
        Pending
      </Title>
      {pendingRows.length === 0 ? (
        <Text>🎉 No pending applications 🎉</Text>
      ) : (
        <Table striped mt={16} withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th></Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Group/District</Table.Th>
              <Table.Th>Predicted</Table.Th>
              <Table.Th>Submitted</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{pendingRows}</Table.Tbody>
        </Table>
      )}

      <Title order={5} mt={16} mb={16}>
        Approved
      </Title>
      <Text>Total predicted or booked: {totalApproved}</Text>
      <Table striped mt={16} withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th></Table.Th>
            <Table.Th>Name</Table.Th>
            <Table.Th>Email</Table.Th>
            <Table.Th>Group/District</Table.Th>
            <Table.Th>Predicted</Table.Th>
            <Table.Th>Booked</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{approvedRows}</Table.Tbody>
      </Table>

      <Title order={5} mt={16} mb={16}>
        Declined
      </Title>
      <Table striped mt={16} withTableBorder>
        <Table.Thead>
          <Table.Tr>
            <Table.Th></Table.Th>
            <Table.Th>Name</Table.Th>
            <Table.Th>Email</Table.Th>
            <Table.Th>Group/District</Table.Th>
            <Table.Th>Predicted</Table.Th>
            <Table.Th>Submitted</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{declinedRows}</Table.Tbody>
      </Table>
    </Container>
  )
}

const ApproveButton = ({ event, application }: { event: TEvent; application: TApplication }) => {
  const mutation = approveApplicationMutation(event.eventId)
  return (
    <ActionIcon loading={mutation.isPending} color="green" variant="filled" onClick={() => mutation.mutate(application.userId)}>
      <IconCheck />
    </ActionIcon>
  )
}

const DeclineButton = ({ event, application }: { event: TEvent; application: TApplication }) => {
  const mutation = declineApplicationMutation(event.eventId)
  return (
    <ActionIcon loading={mutation.isPending} color="red" variant="filled" onClick={() => mutation.mutate(application.userId)}>
      <IconX />
    </ActionIcon>
  )
}

const Avatars = (type: TApplication['type']) => {
  if (type === 'individual') return <Avatar />
  else
    return (
      <Avatar.Group spacing={24}>
        <Avatar color="red" />
        <Avatar color="green" />
        <Avatar color="blue" />
      </Avatar.Group>
    )
}
