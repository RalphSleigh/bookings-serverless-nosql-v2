import { Context } from "aws-lambda"
import { ConfigType } from "./config"
import { DBRole, DBUser } from "../dynamo"
import { getPermissionsFromUser } from "../../shared/permissions"
import { TUser } from "../../shared/schemas/user"
import { TRole } from "../../shared/schemas/role"

type ContextConfig = { config: ConfigType }
type ContextUser = (TUser & { roles: TRole[]}) | undefined

export type ContextWithConfig = Context & { config: ConfigType }
export type ContextWithUser = ContextWithConfig & { user: ContextUser, permissions: ReturnType<typeof getPermissionsFromUser> }
