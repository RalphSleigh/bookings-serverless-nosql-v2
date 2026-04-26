import { ActionIcon, Box, Button, Container, Grid, Group, Paper, Select, Table, Text, TextInput, Title } from '@mantine/core'
import { IconCross, IconEdit, IconX } from '@tabler/icons-react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { useState } from 'react'

import { TBookingResponse } from '../../../../lambda/endpoints/event/manage/getEventBookings'
import { TEvent } from '../../../../shared/schemas/event'
import { TVillages } from '../../../../shared/schemas/villages'
import { manageVillageMutation } from '../../mutations/manageVillages'
import { getEventBookingsQueryOptions } from '../../queries/getEventBookings'
import { useEvent } from '../../utils'

const VILLAGE_OK = 50
const VILLAGE_FULL = 80

export const ManageVillages: React.FC = () => {
  const route = getRouteApi('/_user/event/$eventId/manage')
  const { eventId } = route.useParams()
  const bookingsQuery = useSuspenseQuery(getEventBookingsQueryOptions(eventId))
  const event = useEvent()

  const villages = bookingsQuery.data.villages

  if (villages === undefined)
    return (
      <Container strategy="grid" fluid mt={16}>
        <Box data-breakout>
          <AddVillage eventId={event.eventId} />
        </Box>
      </Container>
    )

  const villageElements = villages.villages.map((village) => (
    <Village key={village.id} name={village.name} id={village.id} eventId={event.eventId} bookings={bookingsQuery.data.bookings.filter((booking) => village.bookings.includes(booking.userId))} />
  ))

  const noVillageBookings = bookingsQuery.data.bookings.filter((booking) => !villages.villages.find((v) => v.bookings.find((b) => b === booking.userId)))

  const noVillageElements = noVillageBookings.map((booking) => <NoVillageBookingElement key={booking.userId} booking={booking} villages={villages} eventId={event.eventId} />)

  return (
    <Container strategy="grid" fluid mt={16}>
      <Box data-breakout>
        <Grid mt={16}>
          <Grid.Col span={{ base: 12, md: 3 }}>{noVillageElements}</Grid.Col>
          <Grid.Col span={{ base: 12, md: 9 }}>
            <AddVillage eventId={event.eventId} />
            {villageElements}
          </Grid.Col>
        </Grid>
      </Box>
    </Container>
  )
}

const AddVillage: React.FC<{ eventId: string }> = ({ eventId }) => {
  const [name, setName] = useState('')
  const mutation = manageVillageMutation(eventId)

  return (
    <Group m={0}>
      <TextInput value={name} onChange={(e) => setName(e.target.value)} style={{ flexGrow: 1 }} />
      <Button disabled={name === '' || mutation.isPending} onClick={() => mutation.mutate({ action: 'create', name: name })}>
        Add Village
      </Button>
    </Group>
  )
}

const Village: React.FC<{ name: string; id: string; eventId: string; bookings: TBookingResponse<TEvent>[] }> = ({ name, id, eventId, bookings }) => {
  const mutation = manageVillageMutation(eventId)

  const renameFn = () => {
    const newName = prompt('New village name', name)
    if (newName && newName !== name) {
      mutation.mutate({ action: 'rename', villageId: id, name: newName })
    }
  }

  const deleteFn = () => {
    if (confirm('Are you sure you want to delete this village? This action cannot be undone.')) {
      mutation.mutate({ action: 'delete', villageId: id })
    }
  }

  const unassignFn = (villageId: string, userId: string) => {
    mutation.mutate({ action: 'unassign', villageId, userId })
  }

  const bookingsElements = bookings.map((booking) => (
    <Table.Tr key={booking.userId}>
      <Table.Td>{'district' in booking.basic && booking.basic.district ? `${booking.basic.district} (${booking.basic.name})` : booking.basic.name}</Table.Td>
      <Table.Td>
        {booking.camping?.who}
        <br />
        {booking.camping?.equipment}
      </Table.Td>
      <Table.Td>{booking.people.length}</Table.Td>
      <Table.Td>
        <ActionIcon onClick={() => unassignFn(id, booking.userId)} color="red" variant="outline">
          <IconX size={16} />
        </ActionIcon>
      </Table.Td>
    </Table.Tr>
  ))

  const total = bookings.reduce((acc, booking) => acc + booking.people.length, 0)

  return (
    <Paper data-breakout shadow="sm" radius="md" withBorder mt="md" p="sm" style={{ borderColor: totalColour(total) }}>
      <Group gap={4}>
        <Title order={3} style={{ flexGrow: 1 }} ml={8}>
          {name}
        </Title>
        <ActionIcon onClick={renameFn} gradient={{ from: 'blue', to: 'cyan', deg: 110 }} variant="gradient">
          <IconEdit size={16} />
        </ActionIcon>
        <ActionIcon onClick={deleteFn} gradient={{ from: 'red', to: 'orange', deg: 110 }} variant="gradient">
          <IconX size={16} />
        </ActionIcon>
      </Group>

      <Table mt="md" striped>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Details</Table.Th>
            <Table.Th>Campers</Table.Th>
            <Table.Th></Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {bookingsElements}
          <Table.Tr>
            <Table.Td>
              <b>Total</b>
            </Table.Td>
            <Table.Td></Table.Td>
            <Table.Td>
              <Text c={totalColour(total)}><b>{total}</b></Text>
            </Table.Td>
            <Table.Td></Table.Td>
          </Table.Tr>
        </Table.Tbody>
      </Table>
    </Paper>
  )
}

const NoVillageBookingElement: React.FC<{ booking: TBookingResponse<TEvent>; villages: TVillages; eventId: string }> = ({ booking, villages, eventId }) => {
  const mutation = manageVillageMutation(eventId)
  const assignVillageOptions = villages.villages.map((village) => ({ label: village.name, value: village.id }))

  const assignVillageFn = (villageId: string | null) => {
    if (villageId) {
      mutation.mutate({ action: 'assign', villageId, userId: booking.userId })
    }
  }

  return (
    <Paper data-breakout shadow="sm" radius="md" withBorder p="sm" mb={8}>
      <Title order={4}>{'district' in booking.basic && booking.basic.district ? `${booking.basic.district} (${booking.basic.name})` : booking.basic.name}</Title>
      <Text>
        <b>Campers:</b> {booking.people.length}
      </Text>
      <Text>
        <b>Who:</b> {booking.camping?.who}
      </Text>
      <Text>
        <b>Equipment:</b> {booking.camping?.equipment}
      </Text>
      <Select mt="md" placeholder="Assign to village" data={assignVillageOptions} onChange={assignVillageFn} />
    </Paper>
  )
}

const totalColour = (number: number) => {
  return number < VILLAGE_OK ? 'green' : number < VILLAGE_FULL ? 'yellow' : 'red'
}
