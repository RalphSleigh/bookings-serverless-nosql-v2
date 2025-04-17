import middy from '@middy/core';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { ContextWithUser } from '../../middleware/context';

export const authRedirect = middy(
  async (event: APIGatewayProxyEvent, context: ContextWithUser) => {
    const config = context.config;
    const redirect_url = `https://${config.AUTH0_DOMAIN}/authorize?response_type=code&client_id=${config.AUTH0_CLIENT_ID}&redirect_uri=${config.BASE_URL}/api/auth/callback&scope=openid profile email&state=123&prompt=login`;

    return {
      statusCode: 301,
      headers: {
        Location: redirect_url,
      },
      body: '',
    } as APIGatewayProxyResult;
  },
);
