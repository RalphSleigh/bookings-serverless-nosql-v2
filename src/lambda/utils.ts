import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import middy from "@middy/core"
import { ContextWithUser } from "./middleware/context"

export function am_in_lambda(): boolean {
    return process.env.LOCAL_SERVER !== "true"
}

export type HandlerFunction = (event: APIGatewayProxyEvent, context: ContextWithUser) => Promise<any>
export type HandlerWrapperType = (fn: HandlerFunction) => middy.MiddyfiedHandler<APIGatewayProxyEvent, APIGatewayProxyResult, Error, ContextWithUser>

export const HandlerWrapper: HandlerWrapperType = fn => {
    return middy(async (event: APIGatewayProxyEvent, context: ContextWithUser) => {
        const result = await fn(event, context)
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(result)
        } as APIGatewayProxyResult
    })
}