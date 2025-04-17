import middy from '@middy/core';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import type { ContextWithUser } from './middleware/context';
import { ZodError } from 'zod';

export function am_in_lambda(): boolean {
  return process.env.LOCAL_SERVER !== 'true';
}

export type HandlerFunction<TPost, TResult> = (event: Omit<APIGatewayProxyEvent, 'body'> & { body: TPost }, context: ContextWithUser) => Promise<TResult>;
export type HandlerWrapperType = <TPost = any, TResult = any>(fn: HandlerFunction<TPost, TResult>) => middy.MiddyfiedHandler<Omit<APIGatewayProxyEvent, 'body'> & { body: TPost }, APIGatewayProxyResult, Error, ContextWithUser>;

export const HandlerWrapper: HandlerWrapperType = <TPost, TResult>(fn: HandlerFunction<TPost, TResult>) => {
  return middy(async (event: Omit<APIGatewayProxyEvent, 'body'> & { body: TPost }, context: ContextWithUser) => {
    try {
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
};
