import middy from "@middy/core";
import httpRouterHandler, { type Method } from '@middy/http-router'
import { getEnv } from "./endpoints/env";
import { configMiddleware } from "./middleware/config";
import httpHeaderNormalizer from "@middy/http-header-normalizer";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { authRedirect } from "./endpoints/auth/redirect";
import { authCallback } from "./endpoints/auth/callback";
import { userMiddleware } from "./middleware/user";

const routes = [
    {
      method: "GET" as Method,
      path: '/api/env',
      handler: getEnv
    },{
      method: "GET" as Method,
      path: '/api/auth/redirect',
      handler: authRedirect
    },{
      method: "GET" as Method,
      path: '/api/auth/callback',
      handler: authCallback
    }
  ]
  
export const handler = middy()
//.use(inputOutputLogger())
.use(httpHeaderNormalizer())
.use(httpJsonBodyParser({disableContentTypeError: true}))
.use(configMiddleware())
.use(userMiddleware())
.handler(httpRouterHandler(routes))