import { Action, Subject } from '../../../shared/permissions'
import { EventSchemaWhenCreating, TEventWhenCreating } from '../../../shared/schemas/event'
import { DBEvent } from '../../dynamo'
import { HandlerWrapper } from '../../utils'

export type TCreateEventData = {
  event: TEventWhenCreating
}

export const createEvent = HandlerWrapper(res => ['create', 'event'], async (req, res) => {
  //export const createEvent = HandlerWrapper<TCreateEventData>(['create', 'event'], async (event, context) => {
  const validatedEvent = EventSchemaWhenCreating.parse(req.body.event)

  res.locals.logger.logToPath(validatedEvent)

  const createdEvent = await DBEvent.create(validatedEvent).go()

  res.locals.logger.logToPath(createdEvent)

  res.json({ ok: 'ok' })
})
