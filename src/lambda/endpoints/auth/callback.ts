import { admin, auth } from '@googleapis/admin'
import cookie from 'cookie'
import { RequestHandler } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'
import jwksClient from 'jwks-rsa'
import { v4 as uuidv4 } from 'uuid'

import { TUser, UserSchema } from '../../../shared/schemas/user'
import { DBRole, DBUser } from '../../dynamo'
import { getAuthClientForScope } from '../../googleAuthClientHack'

export const authCallback: RequestHandler = async (req, res) => {
  try {
    const logToPath = res.locals.logger.logToPath.bind(res.locals.logger)
    const logToSystem = res.locals.logger.logToSystem.bind(res.locals.logger)

    const config = res.locals.config

    const code = req.query.code as string | undefined

    const token = await fetch(`https://${config.AUTH0_DOMAIN}/oauth/token`, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: config.AUTH0_CLIENT_ID,
        client_secret: config.AUTH0_CLIENT_SECRET,
        code: code!,
        redirect_uri: config.BASE_URL,
      }),
    })

    const profileJson = await token.json()

    const client = jwksClient({
      jwksUri: `https://${config.AUTH0_DOMAIN}/.well-known/jwks.json`,
    })

    const kid = jwt.decode(profileJson.id_token, { complete: true })?.header.kid
    const key = await client.getSigningKey(kid!)
    const pubKey = key.getPublicKey()

    const profile = jwt.verify(profileJson.id_token, pubKey, {
      algorithms: ['RS256'],
    }) as JwtPayload

    if (profile === undefined) {
      return res.status(401).send('Unauthorized')
    }

    const userResult = await DBUser.get({ sub: profile.sub! }).go()
    let user: TUser

    res.locals.logger.logToPath('PROFILE')
    res.locals.logger.logToPath(profile)

    if (userResult.data === null) {
      const [source, sub] = profile.sub!.split('|')

      let isWoodcraft = false
      let isisWoodcraftGroupUser = false
      let displayName = profile.name
      let email = profile.email

      if (source === 'google-oauth2') {
        const oauth2Client = await getAuthClientForScope(config, ['https://www.googleapis.com/auth/admin.directory.user.readonly'])

        try {
          const directory = admin({
            version: 'directory_v1',
            auth: oauth2Client,
          })
          const user = await directory.users.get({
            userKey: sub,
          })
          isWoodcraft = true
          isisWoodcraftGroupUser = !!user.data.orgUnitPath?.toLocaleLowerCase().includes('groups-and-districts')
          displayName = user.data.name?.fullName
          email = user.data.primaryEmail
        } catch (e) {
          res.locals.logger.logToPath(e)
        }
      }

      const createResult = await DBUser.create({
        sub: profile.sub!,
        email: email,
        name: displayName,
        avatar: profile.picture,
        isWoodcraft: isWoodcraft,
        isGroupAccount: isisWoodcraftGroupUser,
      }).go()

      user = UserSchema.parse(createResult.data)

      if (config.ENV === 'dev' && user.isWoodcraft) {
        await DBRole.create({ roleId: uuidv4(), userId: user.userId, role: 'admin' }).go()
      }

      logToSystem(`New user created: ${JSON.stringify(user)}`)
    } else {
      user = UserSchema.parse(userResult.data)
      logToSystem(`User found: ${JSON.stringify(user)}`)
    }

    res.locals.logger.logToPath(user)

    const jwt_token = jwt.sign({ id: user.userId }, config.JWT_SECRET, {
      expiresIn: 1000 * 60 * 60 * config.COOKIE_EXPIRY,
    })
    const cookie_string = cookie.serialize('jwt', jwt_token, {
      maxAge: 60 * 60 * config.COOKIE_EXPIRY,
      httpOnly: true,
      sameSite: true,
      path: '/',
    })

    res.cookie('jwt', jwt_token, {
      maxAge: 60 * 60 * config.COOKIE_EXPIRY * 1000,
      httpOnly: true,
      sameSite: true,
    })

    res.redirect(config.BASE_URL)
  } catch (error) {
    res.locals.logger.logToPath('Error in auth callback')
    res.locals.logger.logToPath(error)
    res.status(500).send('Internal Server Error')
  }
}


