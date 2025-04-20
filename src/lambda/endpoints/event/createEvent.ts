import middy from '@middy/core'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

import { getPermissionsFromUser } from '../../../shared/permissions'
import { EventSchema, EventSchemaWhenCreating, TEventSchemaWhenCreating } from '../../../shared/schemas/event'
import { DBEvent, DBRole } from '../../dynamo'
import { ContextWithUser } from '../../middleware/context'
import { HandlerWrapper } from '../../utils'

export type TCreateEventData = {
  event: TEventSchemaWhenCreating
}

export const createEvent = HandlerWrapper<TCreateEventData>(['create', 'event'], async (event, context) => {
  const validatedEvent = EventSchemaWhenCreating.parse(event.body.event)

  console.log(validatedEvent)

  const createdEvent = await DBEvent.create(validatedEvent).go()

  console.log(createdEvent)

  return { ok: 'ok' }
})
