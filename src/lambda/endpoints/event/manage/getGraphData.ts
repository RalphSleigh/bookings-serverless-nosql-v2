import { subject } from '@casl/ability'
import { DBPersonHistory } from '../../../dynamo'
import { HandlerWrapperLoggedIn } from '../../../utils'
import dayjs from 'dayjs'


export type GetGraphDataResponseType = { data:  Array<{"date": string, "count": number}> }

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

        res.json({ data: results })
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
