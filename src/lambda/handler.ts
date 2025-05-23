import middy from '@middy/core'
import httpHeaderNormalizer from '@middy/http-header-normalizer'
import httpJsonBodyParser from '@middy/http-json-body-parser'
import httpRouterHandler, { type Method } from '@middy/http-router'
import inputOutputLogger from '@middy/input-output-logger'

import { authCallback } from './endpoints/auth/callback'
import { logout } from './endpoints/auth/logout'
import { authRedirect } from './endpoints/auth/redirect'
import { getEnv } from './endpoints/env'
import { createEvent } from './endpoints/event/createEvent'
import { editEvent } from './endpoints/event/editEvent'
import { getEvents } from './endpoints/event/getEvents'
import { testCreateRole } from './endpoints/test/addAdminRole'
import { testLoggedIn } from './endpoints/test/testLoggedIn'
import { getUser } from './endpoints/user/getUser'
import { configMiddleware } from './middleware/config'
import { userMiddleware } from './middleware/user'
import { loggerMiddleware } from './middleware/logger'

const routes = [
  {
    method: 'GET' as Method,
    path: '/env',
    handler: getEnv,
  },
  {
    method: 'GET' as Method,
    path: '/auth/redirect',
    handler: authRedirect,
  },
  {
    method: 'GET' as Method,
    path: '/auth/callback',
    handler: authCallback,
  },
  {
    method: 'GET' as Method,
    path: '/user/current',
    handler: getUser,
  },
  {
    method: 'GET' as Method,
    path: '/user/logout',
    handler: logout,
  },
  {
    method: 'GET' as Method,
    path: '/test/loggedIn',
    handler: testLoggedIn,
  },
  {
    method: 'GET' as Method,
    path: '/test/createRole',
    handler: testCreateRole,
  },
  {
    method: 'GET' as Method,
    path: '/events',
    handler: getEvents,
  },
  {
    method: 'POST' as Method,
    path: '/event/create',
    handler: createEvent,
  },
  {
    method: 'POST' as Method,
    path: '/event/{eventId}/edit',
    handler: editEvent,
  },
]

export const handler = middy()
  .use(httpHeaderNormalizer())
  .use(httpJsonBodyParser({ disableContentTypeError: true }))
  .use(loggerMiddleware())
  .use(configMiddleware())
  .use(userMiddleware())
  .handler(httpRouterHandler(routes))
