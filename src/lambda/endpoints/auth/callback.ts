import { admin, auth } from '@googleapis/admin';
import middy from '@middy/core';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import cookie from 'cookie';
import jwt, { JwtPayload } from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

import { DBUser } from '../../dynamo';
import { ContextWithUser } from '../../middleware/context';
import { TUser, UserSchema } from '../../../shared/schemas/user';

export const authCallback = middy(
  async (event: APIGatewayProxyEvent, context: ContextWithUser) => {
    const config = context.config;

    const code = event.queryStringParameters?.code;

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
    });

    const profileJson = await token.json();

    const client = jwksClient({
      jwksUri: `https://${config.AUTH0_DOMAIN}/.well-known/jwks.json`,
    });

    const kid = jwt.decode(profileJson.id_token, { complete: true })?.header
      .kid;
    const key = await client.getSigningKey(kid!);
    const pubKey = key.getPublicKey();

    const profile = jwt.verify(profileJson.id_token, pubKey, {
      algorithms: ['RS256'],
    }) as JwtPayload;

    if (profile === undefined) {
      return {
        statusCode: 401,
        body: 'Unauthorized',
      } as APIGatewayProxyResult;
    }

    const userResult = await DBUser.get({ sub: profile.sub! }).go();
    let user: TUser

    console.log('PROFILE');
    console.log(profile);

    if (userResult.data === null) {
      const [source, sub] = profile.sub!.split('|');

      let isWoodcraft = false;
      let isisWoodcraftGroupUser = false;
      let displayName = profile.name;
      let email = profile.email;

      if (source === 'google-oauth2') {
        const auth_client = new auth.JWT(
          config.GOOGLE_SERVICE_ACCOUNT_EMAIL,
          '',
          config.GOOGLE_PRIVATE_KEY,
          ['https://www.googleapis.com/auth/admin.directory.user.readonly'],
          config.GOOGLE_WORKSPACE_EMAIL,
        );

        try {
          const directory = admin({
            version: 'directory_v1',
            auth: auth_client,
          });
          const user = await directory.users.get({
            userKey: sub,
          });
          isWoodcraft = true;
          isisWoodcraftGroupUser = !!user.data.orgUnitPath
            ?.toLocaleLowerCase()
            .includes('groups-and-districts');
          displayName = user.data.name?.fullName;
          email = user.data.primaryEmail;
        } catch (e) {
          console.log(e);
        }
      }

      const createResult = await DBUser.create({
        sub: profile.sub!,
        email: email,
        name: displayName,
        avatar: profile.picture,
        isWoodcraft: isWoodcraft,
        isGroupAccount: isisWoodcraftGroupUser,
      }).go();
      user = UserSchema.parse(createResult.data)
    } else {
      user = UserSchema.parse(userResult.data)
    }

    console.log(user);

    const jwt_token = jwt.sign({ id: user.userId }, config.JWT_SECRET, {
      expiresIn: 1000 * 60 * 60 * config.COOKIE_EXPIRY,
    });
    const cookie_string = cookie.serialize('jwt', jwt_token, {
      maxAge: 60 * 60 * config.COOKIE_EXPIRY,
      httpOnly: true,
      sameSite: true,
      path: '/',
    });

    return {
      statusCode: 301,
      headers: {
        Location: config.BASE_URL,
        'Set-Cookie': cookie_string,
      },
      body: '',
    } as APIGatewayProxyResult;
  },
);
