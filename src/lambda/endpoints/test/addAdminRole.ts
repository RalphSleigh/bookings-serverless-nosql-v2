import middy from '@middy/core';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { ContextWithUser } from '../../middleware/context';
import { DBRole } from '../../dynamo';
import { getPermissionsFromUser } from '../../../shared/permissions';

export const testCreateRole = middy(
  async (event: APIGatewayProxyEvent, context: ContextWithUser) => {
    const user = context.user;
    const permission = getPermissionsFromUser(user);

    if (!permission.can('manage', 'all')) {
        return {
            statusCode: 401,
            body: 'Unauthorized',
        }
    }

    if(user) {

        const role = await DBRole.create({userId: user.userId, role: 'admin'}).go()

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({role})
        } as APIGatewayProxyResult; 
    } else {  
        return {
            statusCode: 401,
            body: 'Unauthorized',
        }
    }
  },
);
