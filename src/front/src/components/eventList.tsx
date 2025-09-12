import { subject } from '@casl/ability'
import { Button, Container, Paper, Table, Text, Title } from '@mantine/core'
import { useRouteContext } from '@tanstack/react-router'
import dayjs from 'dayjs'
import AdvancedFormat from 'dayjs/plugin/advancedFormat'
import Markdown from 'react-markdown'

import { getFeeType } from '../../../shared/fees/fees.js'
import { TBooking } from '../../../shared/schemas/booking.js'
import { TEvent } from '../../../shared/schemas/event.js'
import { ageGroupFromPerson } from '../../../shared/woodcraft.js'
import { Can } from '../permissionContext'
import { CustomLink, toLocalDate } from '../utils.js'
import { CustomButtonLink } from './custom-inputs/customLinkButton.js'

dayjs.extend(AdvancedFormat)

export function EventList({ events, bookings }: { events: TEvent[]; bookings: TBooking[] }) {
  //const bookingsQuery = useUsersBookings()
  //const bookings = bookingsQuery.data.bookings
  //const user = useContext(UserContext)

  const { permission } = useRouteContext({ from: '__root__' })

  const futureEvents = events.filter((e) => dayjs(e.endDate).isAfter(new Date()))
  const pastEventsCanManage = events.filter((e) => dayjs(e.endDate).isBefore(new Date()) && permission.can('getBackend', subject('eventId', { eventId: e.eventId })))

  const cards = futureEvents
    .sort((a, b) => (a.startDate < b.startDate ? -1 : a.startDate > b.startDate ? 1 : 0))
    .map((e) => <EventCard event={e} key={e.eventId} booking={bookings.find((b) => b.eventId === e.eventId)} />)
  const manageCards = pastEventsCanManage
    .sort((a, b) => (a.startDate < b.startDate ? -1 : a.startDate > b.startDate ? 1 : 0))
    .map((e) => <EventCard event={e} key={e.eventId} booking={bookings.find((b) => b.eventId === e.eventId)} />)

  return (
    <>
      <Container>
        {cards}
        {manageCards.length > 0 ? (
          <>
            <Title size="h1">Past Events</Title>
            {manageCards}
          </>
        ) : null}
      </Container>
    </>
  )
}

function EventCard({ event, booking }: { event: TEvent; booking?: TBooking }) {
  const startDate = toLocalDate(event.startDate)!
  const endDate = toLocalDate(event.endDate)!

  const startDataFormat = dayjs(startDate).isSame(dayjs(endDate), 'month') ? 'Do' : 'Do MMMM'

  return (
    <Paper shadow="md" radius="md" withBorder mt={16} p="md">
      <BookingButton event={event} booking={booking} />
      <Title order={1} size="h2">
        {event.name}
      </Title>
      <Title order={2} size="h4">
        {dayjs(startDate).format(startDataFormat)} - {dayjs(endDate).format('Do MMMM YYYY')}
      </Title>
      {event.description ? <Markdown>{event.description}</Markdown> : null}
      {booking ? <YourBooking event={event} booking={booking} /> : null}
      <Text ta="right" mt={8}>
        <Can I="edit" a="event">
          <CustomLink to={`/event/$eventId/edit`} params={{ eventId: event.eventId }}>
            Edit
          </CustomLink>
        </Can>{' '}
        <Can I="getBackend" this={subject('eventId', { eventId: event.eventId })}>
          <CustomLink to={`/event/$eventId/manage`} params={{ eventId: event.eventId }}>
            Manage
          </CustomLink>
        </Can>
      </Text>
    </Paper>
  )
}

function BookingButton({ event, booking }: { event: TEvent; booking?: TBooking }) {
  const { auth, permission } = useRouteContext({ from: '__root__' })
  const user = auth.loggedIn ? auth.user : undefined
  if (!user)
    return (
      <Button component="a" style={{ float: 'right' }} href="/api/auth/redirect">
        Login to Book
      </Button>
    )

  if (booking && permission.can('update', subject('eventBooking', { event, booking })))
    return (
      <CustomButtonLink to={`/event/$eventId/own/update`} params={{ eventId: event.eventId }} style={{ float: 'right' }}>
        Update Booking
      </CustomButtonLink>
    )

  if (!event.bigCampMode && Date.now() > dayjs(event.bookingDeadline).valueOf())
    return (
      <Button style={{ float: 'right' }} disabled>
        Deadline Passed
      </Button>
    )

  if (permission.can('book', subject('event', event)))
    return (
      <CustomButtonLink style={{ float: 'right' }} to={`/event/$eventId/own/book`} params={{ eventId: event.eventId }}>
        Book
      </CustomButtonLink>
    )

  return (
    <Button variant="contained" style={{ float: 'right' }}>
      Dunno
    </Button>
  )

  /*  if (booking && booking.deleted && CanEditOwnBooking.if({ user, event, booking })) return <Button variant="contained" sx={{ float: "right" }} component={RouterLink} to={`/event/${event.id}/edit-my-booking`}>Re-book
    </Button>

    if (booking && CanEditOwnBooking.if({ user, event, booking })) return <Button variant="contained" sx={{ float: "right" }} component={RouterLink} to={`/event/${event.id}/edit-my-booking`}>Edit my booking
    </Button>

    if (booking && !booking.deleted && event.bigCampMode && Date.now() > parseDate(event.bookingDeadline)!.getTime()) return <Button variant="outlined" sx={{ float: "right" }} component={RouterLink} to={`/event/${event.id}/view-my-booking`}>View Booking</Button>

    

    if (event.applicationsRequired && user.applications.find(a => a.eventId === event.id)) return <Button variant="contained" sx={{ float: "right" }} disabled>Application Pending</Button>

    if (event.applicationsRequired) return <Button variant="contained" sx={{ float: "right" }} component={RouterLink} to={`/event/${event.id}/apply`}>Apply to book</Button>
 */
}

const YourBooking = ({ event, booking }: { event: TEvent; booking: TBooking }) => {
  const fees = getFeeType(event)

  const ageGroupFilter = ageGroupFromPerson(event)

  const people = booking.people.map((p, i) => (
    <Table.Tr key={i}>
      <Table.Td>{p.basic.name}</Table.Td>
      <Table.Td>{ageGroupFilter(p).singular}</Table.Td>
    </Table.Tr>
  ))

  return (
    <>
      <Title order={5} mt={8}>
        Your Booking
      </Title>
      <Text mt={8}>
        You have booked {booking.people.length} {booking.people.length > 1 ? `people` : `person`}:
      </Text>
      <Table striped mt={8}>
        <Table.Thead>
          <Table.Tr>
            <Table.Td>
              <Text fw={700}>Name</Text>
            </Table.Td>
            <Table.Td>
              <Text fw={700}>Age Group</Text>
            </Table.Td>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{people}</Table.Tbody>
      </Table>
      <Title order={5} mt={8}>
        Money
      </Title>
      <fees.EventListDisplayElement event={event} booking={booking} />
    </>
  )
}
