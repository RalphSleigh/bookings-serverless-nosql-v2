import { Button, Fab, Grid, Link, List, ListItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import { format, isSameMonth, parseISO } from 'date-fns'
import Markdown from 'react-markdown'

import { TEvent } from '../../../shared/schemas/event.js'
import { Can } from '../permissionContext'
import { MUILink, toLocalDate } from '../utils.js'

export function EventList({ events }: { events: TEvent[] }) {
  //const bookingsQuery = useUsersBookings()
  //const bookings = bookingsQuery.data.bookings
  //const user = useContext(UserContext)

  const futureEvents = events.filter((e) => parseISO(e.endDate) > new Date())
  //const pastEventsCanManage = events.filter(e => parseISO(e.endDate) < new Date() && CanManageEvent.if({ event: e, user: user }))

  const cards = futureEvents
    .sort((a, b) => (a.startDate < b.startDate ? -1 : a.startDate > b.startDate ? 1 : 0))
    .map((e) => <EventCard event={e} key={e.eventId} /* booking={bookings.find((b) => b.eventId === e.id) }*/ />)
  //const manageCards = pastEventsCanManage.sort((a, b) => (a.startDate < b.startDate) ? -1 : ((a.startDate > b.startDate) ? 1 : 0)).map(e => <EventCard event={e} key={e.id} booking={bookings.find(b => b.eventId === e.id)} />)

  return (
    <>
      <Grid container justifyContent="center">
        <Grid size={{ xs: 12, lg: 10, xl: 8 }}>
          <Grid container spacing={2} p={2}>
            {cards}
            {/* {manageCards.length > 0 ? <Typography sx={{ mt: 2, ml: 2 }} variant="h5">Past Events</Typography> : null}
                    {manageCards} */}
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}

function EventCard({ event }: { event: TEvent }) {
  const startDate = toLocalDate(event.startDate)!
  const endDate = toLocalDate(event.endDate)!

  const startDataFormat = isSameMonth(startDate, endDate) ? 'do' : 'do MMMM'

  return (
    <Grid size={12}>
      <Paper sx={{ p: 2 }} elevation={4}>
        {/* <BookingButton event={event} booking={booking} /> */}
        <Typography variant="h5">{event.name}</Typography>
        <Typography sx={{ mt: 1 }} variant="body1">
          {format(startDate, startDataFormat)} - {format(endDate, 'do MMMM yyyy')}
        </Typography>
        {event.description ? <Markdown>{event.description}</Markdown> : null}
        {/* {booking && !booking.deleted ? <YourBooking event={event} booking={booking}></YourBooking> : null} */}
        <Typography align="right">
          <Can I="edit" a="event">
            <MUILink to={`/event/${event.id}/edit`}>Edit</MUILink>
          </Can>
          {' '}
          <Can I="manage" a="event">
            <MUILink to={`/event/${event.id}/manage`}>Manage</MUILink>
          </Can>
        </Typography>
      </Paper>
    </Grid>
  )
}

/* function BookingButton({ event, booking }: { event: JsonEventType, booking?: JsonBookingType }) {
    const user = useContext(UserContext)
    if (!user) return <Button variant="contained" sx={{ float: "right" }} component={RouterLink} to="/login">Log in to Book</Button>

    if (!event.bigCampMode && Date.now() > parseDate(event.bookingDeadline)!.getTime()) return <Button variant="contained" sx={{ float: "right" }} disabled>Deadline Passed</Button>

    if (booking && booking.deleted && CanEditOwnBooking.if({ user, event, booking })) return <Button variant="contained" sx={{ float: "right" }} component={RouterLink} to={`/event/${event.id}/edit-my-booking`}>Re-book
    </Button>

    if (booking && CanEditOwnBooking.if({ user, event, booking })) return <Button variant="contained" sx={{ float: "right" }} component={RouterLink} to={`/event/${event.id}/edit-my-booking`}>Edit my booking
    </Button>

    if (booking && !booking.deleted && event.bigCampMode && Date.now() > parseDate(event.bookingDeadline)!.getTime()) return <Button variant="outlined" sx={{ float: "right" }} component={RouterLink} to={`/event/${event.id}/view-my-booking`}>View Booking</Button>

    if (CanBookIntoEvent.if({ user, event })) return <Button variant="contained" sx={{ float: "right" }} component={RouterLink} to={`/event/${event.id}/book`}>Book
    </Button>

    if (event.applicationsRequired && user.applications.find(a => a.eventId === event.id)) return <Button variant="contained" sx={{ float: "right" }} disabled>Application Pending</Button>

    if (event.applicationsRequired) return <Button variant="contained" sx={{ float: "right" }} component={RouterLink} to={`/event/${event.id}/apply`}>Apply to book</Button>

    return <Button variant="contained" sx={{ float: "right" }}>Dunno</Button>
} */

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
