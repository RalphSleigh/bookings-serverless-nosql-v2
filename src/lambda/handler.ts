import middy from '@middy/core';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import httpJsonBodyParser from '@middy/http-json-body-parser';
import httpRouterHandler, { type Method } from '@middy/http-router';

import { authCallback } from './endpoints/auth/callback';
import { logout } from './endpoints/auth/logout';
import { authRedirect } from './endpoints/auth/redirect';
import { getEnv } from './endpoints/env';
import { testLoggedIn } from './endpoints/test/testLoggedIn';
import { getUser } from './endpoints/user/getUser';
import { configMiddleware } from './middleware/config';
import { userMiddleware } from './middleware/user';
import { testCreateRole } from './endpoints/test/addAdminRole';
import { createEvent } from './endpoints/event/createEvent';
import { getEvents } from './endpoints/event/getEvents';
import { editEvent } from './endpoints/event/editEvent';

const routes = [
  {
    method: 'GET' as Method,
    path: '/api/env',
    handler: getEnv,
  },
  {
    method: 'GET' as Method,
    path: '/api/auth/redirect',
    handler: authRedirect,
  },
  {
    method: 'GET' as Method,
    path: '/api/auth/callback',
    handler: authCallback,
  },
  {
    method: 'GET' as Method,
    path: '/api/user/current',
    handler: getUser,
  },
  {
    method: 'GET' as Method,
    path: '/api/user/logout',
    handler: logout,
  },
  {
    method: 'GET' as Method,
    path: '/api/test/loggedIn',
    handler: testLoggedIn,
  },
  {
    method: 'GET' as Method,
    path: '/api/test/createRole',
    handler: testCreateRole,
  },
  {
    method: 'GET' as Method,
    path: '/api/events',
    handler: getEvents
  },
  {
    method: 'POST' as Method,
    path: '/api/event/create',
    handler: createEvent
  },
  {
    method: 'POST' as Method,
    path: '/api/event/{eventId}/edit',
    handler: editEvent
  }
];

export const handler = middy()
  //.use(inputOutputLogger())
  .use(httpHeaderNormalizer())
  .use(httpJsonBodyParser({ disableContentTypeError: true }))
  .use(configMiddleware())
  .use(userMiddleware())
  .handler(httpRouterHandler(routes));
