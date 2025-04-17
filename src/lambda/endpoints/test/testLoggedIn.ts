import middy from '@middy/core';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { ContextWithUser } from '../../middleware/context';

export const testLoggedIn = middy(
  async (event: APIGatewayProxyEvent, context: ContextWithUser) => {
    const user = context.user;
    if(user) {
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({user})
        } as APIGatewayProxyResult; 
    } else {  
        return {
            statusCode: 401,
            body: 'Unauthorized',
        }
    }
  },
);
