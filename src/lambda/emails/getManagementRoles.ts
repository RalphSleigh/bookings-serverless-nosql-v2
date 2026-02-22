import { TRole } from "../../shared/schemas/role"
import { DBRole } from "../dynamo"

const MANAGEMENT_ROLES: TRole["role"][] = ['owner', 'manager']

export const getManagementRoles = async (eventId: string) => {
  const roles = await DBRole.find({ eventId: eventId }).go()
  return roles.data?.filter((r) => MANAGEMENT_ROLES.includes(r.role)) || []
}