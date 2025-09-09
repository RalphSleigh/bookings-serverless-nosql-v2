import { RequestHandler, Request, Response } from 'express'
import { ZodError } from "zod/v4";
import { Abilities } from '../shared/permissions';
import { ParamsDictionary } from 'express-serve-static-core';
import { DB } from './dynamo';
import { TBooking } from '../shared/schemas/booking';
import { TPerson } from '../shared/schemas/person';

export function am_in_lambda(): boolean {
  return process.env.LOCAL_SERVER !== 'true'
}

type PermissionFn<B, P> = (req: TypedRequest<B, P>, res: Response) => Abilities
type TypedRequest<B, P> = Request<P, any, B>

export type THandlerWrapper = <B = any, P extends ParamsDictionary = {}>(permissionFn: PermissionFn<B, P>, fn: RequestHandler) => RequestHandler<P, any, B>

export const HandlerWrapper: THandlerWrapper =
  (permissionFn, fn) =>
  async (req, res, next) => {
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
      return res.status(500).json({ error: error.message })
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


export const getBookingByIDs: (eventId: string, userId: string) => Promise<TBooking> = async (eventId, userId) => {
  const bookingsResult = await DB.collections.booking({ eventId, userId }).go()
  if(!bookingsResult.data.booking[0]) throw new Error('Booking not found')
  const booking = bookingsResult.data.booking[0] as TBooking
  booking.people = bookingsResult.data.person.filter((p) => !p.cancelled).sort((a,b) => a.createdAt - b.createdAt) as TPerson[]
  return booking
}