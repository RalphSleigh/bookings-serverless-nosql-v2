import cookie from 'cookie'
import { RequestHandler } from 'express'
import jwt from 'jsonwebtoken'

import { getPermissionsFromUser } from '../../shared/permissions'
import { RoleSchema } from '../../shared/schemas/role'
import { UserSchema } from '../../shared/schemas/user'
import { DB } from '../dynamo'

export const userMiddleware: RequestHandler = async (req, res, next) => {
  try {
    const config = res.locals.config
    const cookie_string = req.cookies.jwt

    if (!cookie_string || cookie_string === '') {
      res.locals.user = undefined
      res.locals.permissions = getPermissionsFromUser(undefined)
      return next()
    }

    const token = jwt.verify(cookie_string, config.JWT_SECRET) as { sub: string; id: string }

    const userResult = await DB.collections.userWithRoles({ userId: token.id }).go()

    if (userResult.data.user.length === 0) {
      res.locals.user = undefined
      res.locals.permissions = getPermissionsFromUser(undefined)
      return next()
    }

    res.locals.user = { ...UserSchema.parse(userResult.data.user[0]), roles: userResult.data.role.map((r) => RoleSchema.parse(r)) }
    res.locals.permissions = getPermissionsFromUser(res.locals.user)
    next()
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      res.locals.user = undefined
      res.locals.permissions = getPermissionsFromUser(undefined)
      res.cookie('jwt', '', { maxAge: 60 * 60, httpOnly: true, sameSite: true, path: '/' })
      return next()
    } else {
      console.log(error)
      throw error
    }
  }
}
