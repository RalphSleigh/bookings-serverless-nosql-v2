import middy from '@middy/core';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { ContextWithUser } from '../../middleware/context';
import { DBEvent, DBRole } from '../../dynamo';
import { getPermissionsFromUser } from '../../../shared/permissions';
import { HandlerWrapper } from '../../utils';
import { EventSchema, EventSchemaWhenCreating, TEventSchemaWhenCreating } from '../../../shared/schemas/event';

export type TCreateEventData = {
  event: TEventSchemaWhenCreating
}

export const createEvent = HandlerWrapper<TCreateEventData>(
  async (event, context) => {
    const user = context.user;
    const permission = getPermissionsFromUser(user);

    if (!permission.can('manage', 'all')) {
        return {
            statusCode: 401,
            body: 'Unauthorized',
        }
    }

    const validatedEvent = EventSchemaWhenCreating.parse(event.body.event);

    console.log(validatedEvent)

    const createdEvent = await DBEvent.create(validatedEvent).go()

    console.log(createdEvent)

    return {ok:"ok"}


  },
);
