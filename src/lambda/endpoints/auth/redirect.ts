import middy from "@middy/core"
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { ContextWithUser } from "../../middleware/context"

export const authRedirect = middy(async (event: APIGatewayProxyEvent, context: ContextWithUser) => {
        return {
            statusCode: 301,
            headers: {
                'Location': 'https://dev-1gvzt72hbdyzvelo.uk.auth0.com/authorize?response_type=code&client_id=Zdi4lVXE1Jif1FZKlnYyx7YJehr3Jxht&redirect_uri=http://localhost:3001/api/auth/callback&scope=openid profile email&state=123'
            },
            body: ''
        } as APIGatewayProxyResult
    })