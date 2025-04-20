import middy from '@middy/core'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { getPermissionsFromUser } from '../../../shared/permissions'
import { EventSchema, EventSchemaWhenCreating, TEvent, TEventSchemaWhenCreating } from '../../../shared/schemas/event'
import { DBEvent, DBRole } from '../../dynamo'
import { ContextWithUser } from '../../middleware/context'
import { HandlerWrapper } from '../../utils'

export type TEditEventData = {
  event: TEvent
}

export const editEvent = HandlerWrapper<TEditEventData>(['create', 'event'], async (event, context) => {
  const validatedEvent = EventSchema.parse(event.body.event)
  console.log(validatedEvent)

  const updatedEvent = await DBEvent.put(validatedEvent).go()

  console.log(updatedEvent)

  return { ok: 'ok' }
})
