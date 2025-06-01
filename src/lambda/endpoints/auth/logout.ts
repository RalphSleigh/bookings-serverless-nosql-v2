import cookie from 'cookie'
import { RequestHandler } from "express"

/* export const logout = middy(async (event: APIGatewayProxyEvent, context: ContextWithUser) => {
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

 */
export const logout: RequestHandler = (req, res) => {
    const config = res.locals.config
    const cookie_string = cookie.serialize("jwt", "", { maxAge: 60 * 60, httpOnly: true, sameSite: true, path: '/' })
    res.cookie('jwt', '', { maxAge: 60 * 60, httpOnly: true, sameSite: true, path: '/' })
    res.redirect("/")
}