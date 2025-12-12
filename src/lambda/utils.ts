import { Request, RequestHandler, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { ZodError } from 'zod/v4'

import { Abilities, getPermissionsFromUser } from '../shared/permissions'
import { TBooking } from '../shared/schemas/booking'
import { TEvent } from '../shared/schemas/event'
import { TPerson } from '../shared/schemas/person'
import { ContextUser, TUser } from '../shared/schemas/user'
import { DB } from './dynamo'
import { ConfigType } from './getConfig'
import { Logger } from './middleware/logger'
import { TFee } from '../shared/schemas/fees'

export function am_in_lambda(): boolean {
  return process.env.LOCAL_SERVER !== 'true'
}

type PermissionFn<Params, ReqBody, Locals extends Record<string, any>> = (req: TypedRequest<Params, ReqBody, Locals>, res: Response<any, Locals>) => Abilities
type TypedRequest<Params, ReqBody, Locals extends Record<string, any>> = Request<Params, any, ReqBody, any, Locals>

export type THandlerWrapper<RouteLocals extends Record<string, any>> = <Params extends ParamsDictionary = {}, Body = any>(
  permissionFn: PermissionFn<Params, Body, RouteLocals>,
  fn: RequestHandler<Params, any, Body, any, RouteLocals>,
) => RequestHandler<Params, any, Body, any, RouteLocals>

interface BasicLocals {
  config: ConfigType
  user: ContextUser
  permissions: ReturnType<typeof getPermissionsFromUser>
  event: TEvent
  booking: TBooking
  logger: Logger
  fees: TFee[]
}

export const HandlerWrapper: THandlerWrapper<BasicLocals> = (permissionFn, fn) => async (req, res, next) => {
  const permission = res.locals.permissions

  if (!permission.can(...permissionFn(req, res))) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    await fn(req, res, next)
  } catch (error: any) {
    console.error('Error in handler:', error)
    if (error instanceof ZodError) {
      return res.status(400).json({ message: "Validation Error, this shouldn't happen" })
    }
    throw error
  }
}

export const HandlerWrapperLoggedIn: THandlerWrapper<BasicLocals & { user: TUser }> = (permissionFn, fn) => async (req, res, next) => {
  const permission = res.locals.permissions

  if (res.locals.user === undefined) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  if (!permission.can(...permissionFn(req, res))) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  try {
    await fn(req, res, next)
  } catch (error: any) {
    console.error('Error in handler:', error)
    if (error instanceof ZodError) {
      return res.status(400).json({ message: "Validation Error, this shouldn't happen" })
    }
    throw error
  }
}

/* 
export type HandlerFunction<TPost, TResult> = (event: Omit<APIGatewayProxyEvent, 'body'> & { body: TPost }, context: ContextWithUser) => Promise<TResult>;
export type HandlerWrapperType = <TPost = any, TResult = any>(permission: [Action, Subject], fn: HandlerFunction<TPost, TResult>) => middy.MiddyfiedHandler<Omit<APIGatewayProxyEvent, 'body'> & { body: TPost }, APIGatewayProxyResult, Error, ContextWithUser>;

export const HandlerWrapper: HandlerWrapperType = <TPost, TResult>([action, subject]: [Action, Subject], fn: HandlerFunction<TPost, TResult>) => {
  return middy(async (event: Omit<APIGatewayProxyEvent, 'body'> & { body: TPost }, context: ContextWithUser) => {
    try {
      if(!context.permissions.can(action, subject)) {
        return {
          statusCode: 401,
          body: 'Unauthorized',
        } as APIGatewayProxyResult;
      }

      const result = await fn(event, context);
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(result),
      } as APIGatewayProxyResult;
    } catch (error: any) {
      console.error('Error in handler:', error);
      if(error instanceof ZodError) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "Vaildation Error, this shouldn't happen" }),
        } as APIGatewayProxyResult;
      }
      return {
        statusCode: 500,
        body: JSON.stringify({ error: error.message }),
      } as APIGatewayProxyResult;
    }
  });
}; */

export const getBookingByIDs: (eventId: string, userId: string) => Promise<{ booking: TBooking, fees: TFee[] }> = async (eventId, userId) => {
  const bookingsResult = await DB.collections.bookingByUserId({ eventId, userId }).go()
  if (!bookingsResult.data.booking[0]) throw new Error('Booking not found')
  const booking = bookingsResult.data.booking[0] as TBooking
  booking.people = bookingsResult.data.person.filter((p) => !p.cancelled).sort((a, b) => a.createdAt - b.createdAt) as TPerson[]
  return  { booking, fees: bookingsResult.data.fee as TFee[] }
}
