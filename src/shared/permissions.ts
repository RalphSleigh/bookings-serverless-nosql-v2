import { Ability, AbilityBuilder, ConditionsMatcher, createMongoAbility, ForcedSubject, MatchConditions, MongoAbility, PureAbility } from '@casl/ability'

import { DBRole } from '../lambda/dynamo'
import { ContextUser } from '../lambda/middleware/context'
import { TRole } from './schemas/role'
import { TEvent } from './schemas/event'
import { parseISO } from 'date-fns'

export type Action = 'manage' | 'get' | 'create' | 'edit' | 'book'
export type Subject = 'all' | 'events' | 'event' | 'currentUser' | 'env' | (TEvent & ForcedSubject<"event">)

const lambdaMatcher: ConditionsMatcher<MatchConditions> = matchConditions => matchConditions;

export const getPermissionsFromUser = (user: ContextUser) => {
  const { can, cannot, build } = new AbilityBuilder<PureAbility<[Action, Subject], MatchConditions>>(createMongoAbility)

  cannot('manage', 'all')
  can('get', 'currentUser')
  can('get', 'env')
  can('get', 'events')


  if (!user) {
    return build({conditionsMatcher: lambdaMatcher})
  }

  can('book', 'event', e => e.bigCampMode === false && parseISO(e.bookingDeadline) > new Date())

  for (const role of user.roles) {
    permissionsFunctions[role.role](can)
  }

  return build({conditionsMatcher: lambdaMatcher})
}

const permissionsFunctions: Record<TRole['role'], (can: AbilityBuilder<PureAbility<[Action, Subject], MatchConditions>>['can']) => void> = {
  admin: (can) => {
    can('manage', 'all')
  },
}
