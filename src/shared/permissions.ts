import { Ability, AbilityBuilder, ConditionsMatcher, createMongoAbility, ForcedSubject, MatchConditions, MongoAbility, PureAbility } from '@casl/ability'

import { TRole } from './schemas/role'
import { TEvent } from './schemas/event'
import { parseISO } from 'date-fns'
import { ContextUser } from './schemas/user'
import { TBooking } from './schemas/booking'

export type Action = 'manage' | 'get' | 'create' | 'edit' | 'book' | 'update'
export type Subject = 'all' 
| 'events' 
| 'event' 
| 'currentUser' 
| 'env' 
| 'ownBookings' 
| "booking" 
| "eventBooking" 
| (TEvent & ForcedSubject<"event">) 
| (TBooking & ForcedSubject<"booking">)
| ({event: TEvent, booking: TBooking} & ForcedSubject<"eventBooking">)

const lambdaMatcher: ConditionsMatcher<MatchConditions> = matchConditions => matchConditions;

export const getPermissionsFromUser = (user: ContextUser) => {
  const { can, cannot, build } = new AbilityBuilder<PureAbility<[Action, Subject], MatchConditions>>(createMongoAbility)

  cannot('manage', 'all')
  can('get', 'currentUser')
  can('get', 'env')
  can('get', 'events')
  can('get', 'ownBookings')

  //edit own bookings
  can('update', 'eventBooking', ({booking: b}) => user !== undefined && b.userId === user.userId)


  if (!user) {
    return build({conditionsMatcher: lambdaMatcher})
  }

  //book into an event
  can('book', 'event', e => e.bigCampMode === false && parseISO(e.bookingDeadline) > new Date())

  for (const role of user.roles) {
    permissionsFunctions[role.role](can)
  }

  return build({conditionsMatcher: lambdaMatcher})
}

const permissionsFunctions: Record<TRole['role'], (can: AbilityBuilder<PureAbility<[Action, Subject], MatchConditions>>['can']) => void> = {
  admin: (can) => {
    can('create', 'event')
  },
}
