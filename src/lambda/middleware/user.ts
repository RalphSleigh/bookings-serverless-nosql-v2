import middy from '@middy/core'
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { ContextWithUser } from './context'
import cookie from 'cookie'
import jwt from 'jsonwebtoken'
import { DB } from '../dynamo'
import { getPermissionsFromUser } from '../../shared/permissions'
import { UserSchema } from '../../shared/schemas/user'
import { RoleSchema } from '../../shared/schemas/role'

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

        const token = jwt.verify(jwt_string, config.JWT_SECRET) as { sub: string, id: string }

        const userResult = await DB.collections.userWithRoles({id: token.id}).go()

        if(userResult.data.user.length === 0) {
          request.context.user = undefined
          return
        }
        
        request.context.user = { ...UserSchema.parse(userResult.data.user[0]), roles: userResult.data.role.map(r => RoleSchema.parse(r)) }
        request.context.permissions = getPermissionsFromUser(request.context.user)
    } catch (error) {
        console.log(error)
        throw error
    }
  }
  return {
    before
  }
}