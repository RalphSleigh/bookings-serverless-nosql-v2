import middy from '@middy/core'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { getPermissionsFromUser } from '../../../shared/permissions'
import { EventSchema, EventSchemaWhenCreating, TEventWhenCreating } from '../../../shared/schemas/event'
import { DBEvent, DBRole } from '../../dynamo'
import { ContextWithUser } from '../../middleware/context'
import { HandlerWrapper } from '../../utils'

export type TCreateEventData = {
  event: TEventWhenCreating
}

export const createEvent = HandlerWrapper<TCreateEventData>(['create', 'event'], async (event, context) => {
  const validatedEvent = EventSchemaWhenCreating.parse(event.body.event)

  console.log(validatedEvent)

  const createdEvent = await DBEvent.create(validatedEvent).go()

  console.log(createdEvent)

  return { ok: 'ok' }
})
