import { subject } from '@casl/ability'
import { DB, DBPersonHistory, DBUser } from '../../../dynamo'
import { HandlerWrapperLoggedIn } from '../../../utils'
import dayjs from 'dayjs'


type LoginData = {
  googleWCF: {bookings: number, total: number}
  google: {bookings: number, total: number}
  apple: {bookings: number, total: number}
  yahoo: {bookings: number, total: number}
  microsoft: {bookings: number, total: number}
  discord: {bookings: number, total: number}
}

export type GetGraphDataResponseType = { data:  Array<{"date": string, "count": number}>, loginData: LoginData }

export const getGraphData = HandlerWrapperLoggedIn<{ eventId: string }>(
  (req, res) => ['getBackend', subject('eventId', { eventId: res.locals.event.eventId })],
  async (req, res) => {
    try {
      const event = res.locals.event
      const people = await DBPersonHistory.match({ eventId: event.eventId }).go({pages: "all"})
      if (people.data && people.data.length > 0) {
        const earliestDate = people.data.reduce((earliest, person) => {
          return person.createdAt < earliest ? person.createdAt : earliest
        }, people.data[0].createdAt)

        const results: Array<{ date: string, count: number }> = []

        for(let day = dayjs(earliestDate).endOf('day'); dayjs().endOf('day').diff(day, 'day') >= 0; day = day.add(1, 'day')) {
            const peopleOnDay = people.data.filter(p => {
                const versions = p.versions.filter(v => dayjs(v.createdAt).isBefore(day))
                return versions.length > 0 && !versions[versions.length - 1].cancelled
            }).length
            results.push({ date: day.format('YYYY-MM-DD'), count: peopleOnDay })
        }

        const users = await DBUser.scan.go({pages: "all"})
        const bookings = await DB.collections.booking({ eventId: event.eventId }).go()

        const googleWCFBookings = bookings.data?.booking.filter(b => users.data?.find(u => u.userId === b.userId && u.sub.includes('google') && u.isWoodcraft))
        const googleBookings = bookings.data?.booking.filter(b => users.data?.find(u => u.userId === b.userId && u.sub.includes('google') && !u.isWoodcraft))
        const appleBookings = bookings.data?.booking.filter(b => users.data?.find(u => u.userId === b.userId && u.sub.includes('apple')))
        const yahooBookings = bookings.data?.booking.filter(b => users.data?.find(u => u.userId === b.userId && u.sub.includes('yahoo')))
        const microsoftBookings = bookings.data?.booking.filter(b => users.data?.find(u => u.userId === b.userId && u.sub.includes('windowslive')))
        const discordBookings = bookings.data?.booking.filter(b => users.data?.find(u => u.userId === b.userId && u.sub.includes('discord')))

        const googleWCFTotal = bookings.data?.person.filter(p => googleWCFBookings?.map(b => b.userId).includes(p.userId)).length
        const googleTotal = bookings.data?.person.filter(p => googleBookings?.map(b => b.userId).includes(p.userId)).length
        const appleTotal = bookings.data?.person.filter(p => appleBookings?.map(b => b.userId).includes(p.userId)).length
        const yahooTotal = bookings.data?.person.filter(p => yahooBookings?.map(b => b.userId).includes(p.userId)).length
        const microsoftTotal = bookings.data?.person.filter(p => microsoftBookings?.map(b => b.userId).includes(p.userId)).length
        const discordTotal = bookings.data?.person.filter(p => discordBookings?.map(b => b.userId).includes(p.userId)).length

        const loginData: LoginData = {
          googleWCF: { bookings: googleWCFBookings.length, total: googleWCFTotal },
          google: { bookings: googleBookings.length, total: googleTotal },
          apple: { bookings: appleBookings.length, total: appleTotal },
          yahoo: { bookings: yahooBookings.length, total: yahooTotal },
          microsoft: { bookings: microsoftBookings.length, total: microsoftTotal },
          discord: { bookings: discordBookings.length, total: discordTotal },
        }

        res.json({ data: results, loginData })
      } else {
        res.status(404).json({ message: 'No Data Found' } as any)
      }
    } catch (error) {
      res.locals.logger.logToPath('Graph Data query failed')
      res.locals.logger.logToPath(error)
      throw error
    }
  },
)
