import { EventSchema, TEvent } from '../../../shared/schemas/event'
import { DBEvent } from '../../dynamo'
import { HandlerWrapper } from '../../utils'

export const deleteEvent = HandlerWrapper((req, res) => ['create', 'event'], async (req, res) => {
  //export const editEvent = HandlerWrapper<TEditEventData>(['create', 'event'], async (event, context) => {
  const validatedEvent = EventSchema.parse({ ...res.locals.event, deleted: true })
  res.locals.logger.logToPath(validatedEvent)

  const updatedEvent = await DBEvent.put(validatedEvent).go()

  res.locals.logger.logToPath(updatedEvent)

  res.json({ ok: 'ok' })
})
