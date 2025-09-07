import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { RequestHandler } from 'express'

import { getPermissionsFromUser } from '../../../shared/permissions'
import { DBRole } from '../../dynamo'

export const testCreateRole: RequestHandler = async (req, res) => {
  const user = res.locals.user
  const permission = getPermissionsFromUser(user)

  /*     if (!permission.can('manage', 'all')) {
        return {
            statusCode: 401,
            body: 'Unauthorized',
        }
    } */

  if (user) {
    const role = await DBRole.create({ userId: user.userId, role: 'admin', eventId: "*"}).go()

    res.json(role)
  } else {
    res.status(401).json({ error: 'Unauthorized' })
  }
}
