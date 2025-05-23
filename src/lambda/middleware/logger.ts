import middy from '@middy/core'
import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'

export const loggerMiddleware = (): middy.MiddlewareObj<APIGatewayProxyEvent, APIGatewayProxyResult, Error, Context> => {
  const before: middy.MiddlewareFn<APIGatewayProxyEvent, APIGatewayProxyResult, Error, Context> = async (request): Promise<void> => {
    //@ts-expect-error
    const {options, ...rest } = request.event
    console.log('Request:', JSON.stringify(rest))
  }
  return {
    before,
  }
}
