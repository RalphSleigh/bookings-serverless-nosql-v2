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
<<<<<<< HEAD
    },{
      method: "GET" as Method,
      path: '/api/auth/redirect',
      handler: authRedirect
    },{
      method: "GET" as Method,
      path: '/api/auth/callback',
      handler: authCallback
=======
>>>>>>> 125a5e82906a257ccdb3796ff8d14693dfe4e18d
    }
  ]
  
export const handler = middy()
//.use(inputOutputLogger())
.use(httpHeaderNormalizer())
.use(httpJsonBodyParser({disableContentTypeError: true}))
.use(configMiddleware())
<<<<<<< HEAD
.use(userMiddleware())
=======
>>>>>>> 125a5e82906a257ccdb3796ff8d14693dfe4e18d
.handler(httpRouterHandler(routes))