import { ActionIcon, Avatar, Box, Button, Container, Flex, Grid, Modal, NumberInput, Overlay, Paper, Table, Text, TextInput, Title, Transition } from '@mantine/core'
import pdf from '@stdlib/stats-base-dists-normal-pdf'
import { IconCheck, IconCurrencyPound, IconX } from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { defaultParseSearch, getRouteApi } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

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
      <Table.Td>{app.minPredicted === app.maxPredicted ? app.minPredicted : `${app.minPredicted} - ${app.maxPredicted}`}</Table.Td>
      <Table.Td>{dayjs(app.createdAt).format('DD/MM/YYYY')}</Table.Td>
      <Table.Td>
        <Flex gap={8}>
          <ApproveButton event={event} application={app} />
          <DeclineButton event={event} application={app} />
        </Flex>
      </Table.Td>
    </Table.Tr>
  ))

  const approved = useMemo(() => applicationsQuery.data.applications.filter((a) => a.status === 'approved').sort((a, b) => ((b.maxPredicted + b.minPredicted) / 2) - ((a.maxPredicted + a.minPredicted) / 2)), [applicationsQuery.data])

  const approvedRows = approved.map((app) => {
    const booking = bookings.find((b) => b.userId === app.userId)
    return (
      <Table.Tr key={app.userId}>
        <Table.Td>{Avatars(app.type)}</Table.Td>
        <Table.Td>{app.name}</Table.Td>
        <Table.Td>
          <a href={`mailto:${app.email}`}>{app.email}</a>
        </Table.Td>
        <Table.Td>{app.district}</Table.Td>
        <Table.Td>{app.minPredicted === app.maxPredicted ? app.minPredicted : `${app.minPredicted} - ${app.maxPredicted}`}</Table.Td>
        <Table.Td>{booking ? booking.people.filter(p => !p.cancelled).length : ''}</Table.Td>
        <Table.Td>
          <Flex gap={8}>
            <DeclineButton event={event} application={app} />
          </Flex>
        </Table.Td>
      </Table.Tr>
    )
  })

  const totalApprovedMin = approved.reduce((a, c) => {
    return a + c.minPredicted
  }, 0)

  const totalApprovedMax = approved.reduce((a, c) => {
    return a + c.maxPredicted
  }, 0)

  const totalMean = approved.reduce((a, c) => {
    return a + (c.minPredicted + c.maxPredicted) / 2
  }, 0)
  const totalStdDev = Math.sqrt(
    approved.reduce((a, c) => {
      const range = (c.maxPredicted - c.minPredicted) / 2 
      return a + range * range
    }, 0),
  )

  const normalFunction = pdf.factory(totalMean, totalStdDev)

  const probs = Array.from({ length: totalMean * 1.5 }, (_, i) => i)
    .map((i) => {
      const x = i
      return normalFunction(x)
    })
    .map((p, i) => ({ name: i, value: p }))

  const totalBooked = bookings.reduce((a, c) => a + c.people.filter(p => !p.cancelled).length, 0)

  const declined = useMemo(() => applicationsQuery.data.applications.filter((a) => a.status === 'declined').sort((a, b) => b.createdAt - a.createdAt), [applicationsQuery.data])
  const declinedRows = declined.map((app) => (
    <Table.Tr key={app.userId}>
      <Table.Td>{Avatars(app.type)}</Table.Td>
      <Table.Td>{app.name}</Table.Td>

      <Table.Td>
        <a href={`mailto:${app.email}`}>{app.email}</a>
      </Table.Td>
      <Table.Td>{app.district}</Table.Td>
      <Table.Td>{app.minPredicted === app.maxPredicted ? app.minPredicted : `${app.minPredicted} - ${app.maxPredicted}`}</Table.Td>
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
      <Text mb={16}>
        Total predicted: {totalApprovedMin} - {totalApprovedMax}, booked: {totalBooked}
      </Text>
      <ResponsiveContainer width="100%" height={100}>
      <AreaChart width={730} height={250} data={probs} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <XAxis dataKey="name" domain={[0, 'auto']} interval={19}/>
        <YAxis interval={1} domain={[0, 'auto']}/>
        <CartesianGrid strokeDasharray="3 3" />
        <Area type="monotone" dataKey="value" stroke="#82ca9d" fillOpacity={1} fill="#82ca9d" />
        <Tooltip/>
        <ReferenceLine x={totalBooked} stroke="red"/>
      </AreaChart>
      </ResponsiveContainer>
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
