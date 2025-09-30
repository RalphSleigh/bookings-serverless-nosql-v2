import { RequestHandler } from 'express'

export const authRedirect: RequestHandler = (req, res) => {
  const config = res.locals.config
  const redirect_url = `https://${config.AUTH0_DOMAIN}/authorize?response_type=code&client_id=${config.AUTH0_CLIENT_ID}&redirect_uri=${config.BASE_URL}/api/auth/callback&scope=openid profile email&state=123&prompt=login`
  res.cookie('redirect', req.query.redirect || '/', { maxAge: 10 * 60 * 1000, httpOnly: true, path: '/' })
  res.redirect(redirect_url)
}

/* export const authRedirect = middy(
  async (event: APIGatewayProxyEvent, context: ContextWithUser) => {
    const config = context.config;
    const redirect_url = `https://${config.AUTH0_DOMAIN}/authorize?response_type=code&client_id=${config.AUTH0_CLIENT_ID}&redirect_uri=${config.BASE_URL}/api/auth/callback&scope=openid profile email&state=123&prompt=login`;

    return {
      statusCode: 301,
      headers: {
        Location: redirect_url,
      },
      body: '',
    } as APIGatewayProxyResult;
  },
);
 */
