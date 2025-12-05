import { subject } from '@casl/ability'
import { Button, Container, Paper, Table, Text, Title } from '@mantine/core'
import { useSuspenseQueries, useSuspenseQuery } from '@tanstack/react-query'
import { LinkProps, useRouteContext } from '@tanstack/react-router'
import dayjs from 'dayjs'
import AdvancedFormat from 'dayjs/plugin/advancedFormat.js'
import Markdown from 'react-markdown'

import { getFeeType } from '../../../shared/fees/fees.js'
import { TApplication } from '../../../shared/schemas/application.js'
import { TBooking } from '../../../shared/schemas/booking.js'
import { TEvent } from '../../../shared/schemas/event.js'
import { TFee } from '../../../shared/schemas/fees.js'
import { TUser } from '../../../shared/schemas/user.js'
import { ageGroupFromPerson } from '../../../shared/woodcraft.js'
import { Can } from '../permissionContext'
import { getEventsQueryOptions } from '../queries/getEvents.js'
import { getUserBookingsQueryOptions } from '../queries/geUserBookings.js'
import { CustomLink, toLocalDate } from '../utils.js'
import { CustomButtonLink } from './custom-inputs/customLinkButton.js'

dayjs.extend(AdvancedFormat)

export function EventList() {
  //const eventsQuery = useSuspenseQuery(getEventsQueryOptions)
  //const bookingsQuery = useSuspenseQuery(getUserBookingsQueryOptions)
  const [eventsQuery, bookingsQuery] = useSuspenseQueries({ queries: [getEventsQueryOptions, getUserBookingsQueryOptions] })

  const events = eventsQuery.data.events
  const bookings = bookingsQuery.data.bookings
  const fees = bookingsQuery.data.fees
  const applications = bookingsQuery.data.applications

  const { auth, permission } = useRouteContext({ from: '__root__' })
  const user = auth.loggedIn ? (auth.user as TUser) : undefined

  const futureEvents = events.filter((e) => dayjs(e.endDate).isAfter(new Date()))
  const pastEventsCanManage = events.filter((e) => dayjs(e.endDate).isBefore(new Date()) && permission.can('getBackend', subject('eventId', { eventId: e.eventId })))

  const cards = futureEvents
    .sort((a, b) => (a.startDate < b.startDate ? -1 : a.startDate > b.startDate ? 1 : 0))
    .map((e) => (
      <EventCard
        user={user}
        event={e}
        key={e.eventId}
        booking={bookings.find((b) => b.eventId === e.eventId)}
        fees={fees.filter((f) => f.eventId === e.eventId)}
        application={applications.find((a) => a.eventId === e.eventId)}
      />
    ))
  const manageCards = pastEventsCanManage
    .sort((a, b) => (a.startDate < b.startDate ? -1 : a.startDate > b.startDate ? 1 : 0))
    .map((e) => (
      <EventCard
        event={e}
        key={e.eventId}
        user={user}
        booking={bookings.find((b) => b.eventId === e.eventId)}
        fees={fees.filter((f) => f.eventId === e.eventId)}
        application={applications.find((a) => a.eventId === e.eventId)}
      />
    ))

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

function EventCard({ event, booking, fees, application, user }: { event: TEvent; booking?: TBooking; fees: TFee[]; application: TApplication | undefined; user?: TUser }) {
  const startDate = toLocalDate(event.startDate)!
  const endDate = toLocalDate(event.endDate)!

  const startDataFormat = dayjs(startDate).isSame(dayjs(endDate), 'month') ? 'Do' : 'Do MMMM'

  return (
    <Paper shadow="md" radius="md" withBorder mt={16} p="md">
      <BookingButton event={event} booking={booking} application={application} />
      <Title order={1} size="h2">
        {event.name}
      </Title>
      <Title order={2} size="h4">
        {dayjs(startDate).format(startDataFormat)} - {dayjs(endDate).format('Do MMMM YYYY')}
      </Title>
      {event.description ? <Markdown>{event.description}</Markdown> : null}
      {user && booking ? <YourBooking event={event} booking={booking} fees={fees} /> : null}
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

function BookingButton({ event, booking, application }: { event: TEvent; booking?: TBooking; application?: TApplication }) {
  const { auth, permission } = useRouteContext({ from: '__root__' })
  const user = auth.loggedIn ? auth.user : undefined
  if (!user)
    return (
      <Button component="a" variant="gradient" gradient={{ from: 'yellow', to: 'orange', deg: 110 }} style={{ float: 'right' }} href="/api/auth/redirect">
        Login to Book
      </Button>
    )

  const LoginButton = ({ to, gradFrom, gradTo, children, disabled = false }: LinkProps & { gradFrom: string; gradTo: string; disabled?: boolean; children: React.ReactNode }) => (
    <CustomButtonLink
      variant="gradient"
      gradient={{ from: gradFrom, to: gradTo, deg: 110 }}
      to={to as `/event/$eventId`}
      params={{ eventId: event.eventId }}
      style={{ float: 'right' }}
      disabled={disabled}
    >
      {children}
    </CustomButtonLink>
  )

  if (event.applicationsRequired) {
    if (application) {
      if (application.status === 'approved') {
        if (booking && !booking.cancelled) {
          return (
            <LoginButton to={`/event/$eventId/own/update`} gradFrom="blue" gradTo="violet">
              Update Booking
            </LoginButton>
          )
        } else if (booking && booking.cancelled) {
          return (
            <LoginButton to={`/event/$eventId/own/update`} gradFrom="blue" gradTo="violet">
              Book
            </LoginButton>
          )
        } else {
          return (
            <LoginButton to={`/event/$eventId/own/book`} gradFrom="blue" gradTo="violet">
              Book
            </LoginButton>
          )
        }
      } else if (application.status === 'pending') {
        return (
          <LoginButton to={`/event/$eventId/own/book`} gradFrom="yellow" gradTo="red" disabled>
            Application Pending
          </LoginButton>
        )
      } else if (application.status === 'declined') {
        return (
          <LoginButton to={`/event/$eventId/own/book`} gradFrom="yellow" gradTo="red" disabled>
            Application Declined
          </LoginButton>
        )
      }
    } else {
      return (
        <LoginButton to={`/event/$eventId/own/apply`} gradFrom="yellow" gradTo="red">
          Apply to Book
        </LoginButton>
      )
    }
  }

  if (booking && booking.cancelled && permission.can('update', subject('eventBooking', { event, booking })))
    return (
      <CustomButtonLink variant="gradient" gradient={{ from: 'blue', to: 'violet', deg: 110 }} to={`/event/$eventId/own/update`} params={{ eventId: event.eventId }} style={{ float: 'right' }}>
        Book
      </CustomButtonLink>
    )

  if (booking && permission.can('update', subject('eventBooking', { event, booking })))
    return (
      <CustomButtonLink variant="gradient" gradient={{ from: 'blue', to: 'violet', deg: 110 }} to={`/event/$eventId/own/update`} params={{ eventId: event.eventId }} style={{ float: 'right' }}>
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
      <CustomButtonLink variant="gradient" gradient={{ from: 'blue', to: 'violet', deg: 110 }} style={{ float: 'right' }} to={`/event/$eventId/own/book`} params={{ eventId: event.eventId }}>
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

const YourBooking = ({ event, booking, fees }: { event: TEvent; booking: TBooking; fees: TFee[] }) => {
  const context = useRouteContext({ from: '__root__' })
  const user = context.auth.user as TUser
  const feeStructure = getFeeType(event)

  const ageGroupFilter = ageGroupFromPerson(event)

  const people = booking.people.map((p, i) => (
    <Table.Tr key={i}>
      <Table.Td>{p.basic.name}</Table.Td>
      <Table.Td>{ageGroupFilter(p).toAgeGroupString()}</Table.Td>
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
      <feeStructure.EventListDisplayElement event={event} booking={booking} user={user} fees={fees} />
    </>
  )
}
