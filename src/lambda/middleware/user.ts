import middy from '@middy/core'
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { ContextWithUser } from './context'
import cookie from 'cookie'
import jwt from 'jsonwebtoken'
import { User } from '../dynamo'

export const userMiddleware = (): middy.MiddlewareObj<APIGatewayProxyEvent, APIGatewayProxyResult, Error, ContextWithUser> => {
  const before: middy.MiddlewareFn<APIGatewayProxyEvent, APIGatewayProxyResult, Error, ContextWithUser> = async (
    request
  ): Promise<void> => {
    try {

        const config = request.context.config
        const cookie_string = request.event.headers.cookie

        if (!cookie_string) {
          request.context.user = undefined
          return
      }
        const jwt_string = cookie.parse(cookie_string)?.jwt

        if (!jwt_string || jwt_string === "") {
            request.context.user = undefined
            return
        }

        const token = jwt.verify(jwt_string, config.JWT_SECRET) as { sub: string }
        const userResult = await User.get({sub: token.sub}).go()

        if(!userResult.data) {
            throw "no user found"
        }
        request.context.user = userResult.data
    } catch (error) {
        console.log(error)
        throw error
    }
  }
  return {
    before
  }
}