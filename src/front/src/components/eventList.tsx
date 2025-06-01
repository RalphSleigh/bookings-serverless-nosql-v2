import { format, isSameMonth, parseISO } from 'date-fns'
import Markdown from 'react-markdown'

import { TEvent } from '../../../shared/schemas/event.js'
import { Can } from '../permissionContext'
import { CustomLink, toLocalDate } from '../utils.js'
import { Container, Paper, Title, Text, Button } from '@mantine/core'
import { useRouteContext } from '@tanstack/react-router'
import { CustomButtonLink } from './customLinkButton.js'
import { subject } from '@casl/ability'
import { TBooking } from '../../../shared/schemas/booking.js'

export function EventList({ events, bookings }: { events: TEvent[], bookings: TBooking[] }) {
  //const bookingsQuery = useUsersBookings()
  //const bookings = bookingsQuery.data.bookings
  //const user = useContext(UserContext)

  const futureEvents = events.filter((e) => parseISO(e.endDate) > new Date())
  //const pastEventsCanManage = events.filter(e => parseISO(e.endDate) < new Date() && CanManageEvent.if({ event: e, user: user }))

  const cards = futureEvents
    .sort((a, b) => (a.startDate < b.startDate ? -1 : a.startDate > b.startDate ? 1 : 0))
    .map((e) => <EventCard event={e} key={e.eventId} booking={bookings.find((b) => b.eventId === e.eventId) } />)
  //const manageCards = pastEventsCanManage.sort((a, b) => (a.startDate < b.startDate) ? -1 : ((a.startDate > b.startDate) ? 1 : 0)).map(e => <EventCard event={e} key={e.id} booking={bookings.find(b => b.eventId === e.id)} />)

  return (
    <>
      <Container>
            {cards}
            {/* {manageCards.length > 0 ? <Typography sx={{ mt: 2, ml: 2 }} variant="h5">Past Events</Typography> : null}
                    {manageCards} */}
      </Container>
    </>
  )
}

function EventCard({ event, booking }: { event: TEvent, booking?: TBooking  }) {
  const startDate = toLocalDate(event.startDate)!
  const endDate = toLocalDate(event.endDate)!

  const startDataFormat = isSameMonth(startDate, endDate) ? 'do' : 'do MMMM'

  return (
      <Paper shadow="md" radius="md" withBorder mt={16} p="md">
        <BookingButton event={event} booking={booking} />
        <Title order={1} size="h2">{event.name}</Title>
        <Title order={2} size="h4">
          {format(startDate, startDataFormat)} - {format(endDate, 'do MMMM yyyy')}
        </Title>
        {event.description ? <Markdown>{event.description}</Markdown> : null}
        {/* {booking && !booking.deleted ? <YourBooking event={event} booking={booking}></YourBooking> : null} */}
        <Text ta="right">
          <Can I="edit" a="event">
            <CustomLink to={`/event/$eventId/edit`} params={{eventId: event.eventId}}>Edit</CustomLink>
          </Can>
          {' '}
          <Can I="manage" a="event">
            <CustomLink to={`/event/${event.eventId}/manage`}>Manage</CustomLink>
          </Can>
        </Text>
      </Paper>
  )
}

function BookingButton({ event, booking }: { event: TEvent, booking?: TBooking }) {
    const { auth, permission } = useRouteContext({ from: '__root__' })
    const user = auth.loggedIn ? auth.user : undefined
    if (!user) return <Button component="a" style={{float:'right'}} href="/api/auth/redirect">
            Login to Book
          </Button>

    if(booking && permission.can('update', subject('eventBooking', {event, booking}))) return <CustomButtonLink to={`/event/$eventId/own/update`} params={{eventId: event.eventId}} style={{float:'right'}}>
            Update Booking
          </CustomButtonLink>

    if (!event.bigCampMode && Date.now() > parseISO(event.bookingDeadline).getTime()) return <Button style={{float:'right'}} disabled>Deadline Passed</Button>

    if (permission.can('book', subject('event', event))) return <CustomButtonLink style={{float:'right'}} to={`/event/$eventId/own/book`} params={{eventId: event.eventId}}>Book
    </CustomButtonLink>

    return <Button variant="contained" style={{float:'right'}}>Dunno</Button>

    if (booking && booking.deleted && CanEditOwnBooking.if({ user, event, booking })) return <Button variant="contained" sx={{ float: "right" }} component={RouterLink} to={`/event/${event.id}/edit-my-booking`}>Re-book
    </Button>

    if (booking && CanEditOwnBooking.if({ user, event, booking })) return <Button variant="contained" sx={{ float: "right" }} component={RouterLink} to={`/event/${event.id}/edit-my-booking`}>Edit my booking
    </Button>

    if (booking && !booking.deleted && event.bigCampMode && Date.now() > parseDate(event.bookingDeadline)!.getTime()) return <Button variant="outlined" sx={{ float: "right" }} component={RouterLink} to={`/event/${event.id}/view-my-booking`}>View Booking</Button>

    

    if (event.applicationsRequired && user.applications.find(a => a.eventId === event.id)) return <Button variant="contained" sx={{ float: "right" }} disabled>Application Pending</Button>

    if (event.applicationsRequired) return <Button variant="contained" sx={{ float: "right" }} component={RouterLink} to={`/event/${event.id}/apply`}>Apply to book</Button>

    
}

/* function YourBooking({ event, booking }: { event: JsonEventType, booking: JsonBookingType }) {

    const enhancedBooking = addComputedFieldsToBookingsQueryResult([booking], event)[0]

    const fee = getFee(event)

    const people = enhancedBooking.participants.map((p, i) => <TableRow key={i} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
        <TableCell component="th" scope="row">{p.basic?.name}</TableCell>
        <TableCell component="td">{p.ageGroup.displayAgeGroup(p.age)}</TableCell>
        <TableCell component="td">{p.kp?.diet}</TableCell>
    </TableRow>)

    return <>
        <Typography variant="subtitle1">You have booked {booking.participants.length} {booking.participants.length > 1 ? `people` : `person`}:</Typography>
        <TableContainer component={Paper} sx={{ mt: 2, p: 1 }}>
            <Table size="small">
                <TableBody>
                    {people}
                </TableBody>
            </Table>
        </TableContainer>
        <fee.DescriptionElement event={event} booking={enhancedBooking} />
        <fee.StripeElement event={event} booking={booking} />
    </>
} */
