import middy from "@middy/core"
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import jwt, { JwtPayload } from 'jsonwebtoken'
import jwksClient from 'jwks-rsa'
import { User } from "../../dynamo"
import { EntityItem } from "electrodb"
import cookie from 'cookie'
import { ContextWithUser } from "../../middleware/context"

export const authCallback = middy(async (event: APIGatewayProxyEvent, context: ContextWithUser) => {

    const config = context.config

    const code = event.queryStringParameters?.code

    const token = await fetch('https://dev-1gvzt72hbdyzvelo.uk.auth0.com/oauth/token', {
        method: 'POST',
        headers: {'content-type': 'application/x-www-form-urlencoded'},
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: 'Zdi4lVXE1Jif1FZKlnYyx7YJehr3Jxht',
          client_secret: 'JzxjI-pG4rtsPlfKWSduZWDZBciorKLIhCpAtmJ7p9yCwhCP2xCwjoAYfUo1jLA1',
          code: code!,
          redirect_uri: 'http://localhost:3001'
        })
      })

      const profileJson = await token.json()

      const client = jwksClient({
        jwksUri: 'https://dev-1gvzt72hbdyzvelo.uk.auth0.com/.well-known/jwks.json'
      });

      const kid = jwt.decode(profileJson.id_token, {complete: true})?.header.kid
      const key = await client.getSigningKey(kid!)
      const pubKey = key.getPublicKey()

      const profile = jwt.verify(profileJson.id_token, pubKey, {algorithms: ['RS256']}) as JwtPayload

      if(profile === undefined) {
        return {
            statusCode: 401,
            body: 'Unauthorized'
        } as APIGatewayProxyResult
    }

      const userResult = await User.get({sub: profile.sub!}).go()
      let user: EntityItem<typeof User>

      if(userResult.data === null) {
        const createResult = await User.create({
            sub: profile.sub!,
            email: profile.email!,
            name: profile.name!
        }).go()
        user = createResult.data
      } else {
        user = userResult.data
      }

      console.log(user)

      const jwt_token = jwt.sign({ sub: user.sub }, config.JWT_SECRET, { expiresIn: 60 * 60 * config.COOKIE_EXPIRY })
      const cookie_string = cookie.serialize("jwt", jwt_token, { maxAge: 60 * 60, httpOnly: true, sameSite: true, path: '/' })

        return {
            statusCode: 301,
            headers: {
                'Location': 'http://localhost:3001/',
                'Set-Cookie': cookie_string
            },
            body: ''
        } as APIGatewayProxyResult
    })