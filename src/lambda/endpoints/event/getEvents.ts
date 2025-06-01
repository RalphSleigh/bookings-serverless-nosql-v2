import { EventSchema, TEvent } from '../../../shared/schemas/event'
import { DBEvent } from '../../dynamo'
import { HandlerWrapper } from '../../utils'

export type getEventsResponseType = { events: TEvent[] }
export const getEvents = HandlerWrapper(res => ['get', 'events'], async (req, res) => {
  try {
    const events = await DBEvent.query.natural({}).go()
    if (events.data) res.json({ events: events.data.map((event) => EventSchema.parse(event)) })
  } catch (error) {
    console.log('Events query failed')
    console.log(error)
    throw error
  }
})
