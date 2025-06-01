import { RequestHandler, Response } from 'express'
import { ZodError } from "zod/v4";

import { Action, Subject } from '../shared/permissions'
import { sub } from 'date-fns'

export function am_in_lambda(): boolean {
  return process.env.LOCAL_SERVER !== 'true'
}

type PermissionFn = (res: Response) => [action: Action, subject: Subject]

export type THandlerWrapper = (permissionFn: PermissionFn, fn: RequestHandler) => RequestHandler

export const HandlerWrapper: THandlerWrapper =
  (permissionFn, fn) =>
  async (req, res, next) => {
    const permission = res.locals.permissions

    if (!permission.can(...permissionFn(res))) {
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
