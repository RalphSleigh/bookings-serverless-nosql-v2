import middy from "@middy/core"
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { ContextWithUser } from "../../middleware/context"
import cookie from 'cookie'

export const logout = middy(async (event: APIGatewayProxyEvent, context: ContextWithUser) => {
        const config = context.config

        const cookie_string = cookie.serialize("jwt", "", { maxAge: 60 * 60, httpOnly: true, sameSite: true, path: '/' })

        return {
            statusCode: 301,
            headers: {
                'Location': config.BASE_URL,
                'Set-Cookie': cookie_string
            },
            body: ''
        } as APIGatewayProxyResult
    })