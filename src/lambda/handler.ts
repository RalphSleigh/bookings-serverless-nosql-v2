import middy from "@middy/core";
import httpRouterHandler, { type Method } from '@middy/http-router'
import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { getEnv } from "./endpoints/env";
import { configMiddleware, type ContextWithConfig } from "./config";
import httpHeaderNormalizer from "@middy/http-header-normalizer";
import httpJsonBodyParser from "@middy/http-json-body-parser";

const routes = [
    {
      method: "GET" as Method,
      path: '/api/env',
      handler: getEnv
    }
  ]
  
export const handler = middy()
//.use(inputOutputLogger())
.use(httpHeaderNormalizer())
.use(httpJsonBodyParser({disableContentTypeError: true}))
.use(configMiddleware())
.handler(httpRouterHandler(routes))