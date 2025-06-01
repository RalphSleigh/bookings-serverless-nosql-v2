import { EventSchema, TEvent } from '../../../shared/schemas/event'
import { DBEvent } from '../../dynamo'
import { HandlerWrapper } from '../../utils'

export type TEditEventData = {
  event: TEvent
}

export const editEvent = HandlerWrapper(res => ['create', 'event'], async (req, res) => {
  //export const editEvent = HandlerWrapper<TEditEventData>(['create', 'event'], async (event, context) => {
  if (req.body.event.eventId !== res.locals.event.eventId) {
    throw new Error('Event ID in path and body do not match')
  }
  const validatedEvent = EventSchema.parse(req.body.event)
  console.log(validatedEvent)

  const updatedEvent = await DBEvent.put(validatedEvent).go()

  console.log(updatedEvent)

  res.json({ ok: 'ok' })
})
