import { Ability, AbilityBuilder, ConditionsMatcher, createMongoAbility, ForcedSubject, MatchConditions, MongoAbility, PureAbility } from '@casl/ability'
import { Optional } from '@tanstack/react-query'
import dayjs from 'dayjs'

import { TBooking } from './schemas/booking'
import { TEvent } from './schemas/event'
import { TRole, TRoleForForm } from './schemas/role'
import { ContextUser } from './schemas/user'

export type EventID = Pick<TEvent, 'eventId'>

export type Abilities =
  | ['manage', 'all']
  | ['get', 'events' | 'event' | 'currentUser' | 'env' | 'ownBookings' | 'users']
  | ['update' | 'getSheet', 'eventBooking' | ({ event: TEvent; booking: TBooking } & ForcedSubject<'eventBooking'>)]
  | ['book', 'event' | (TEvent & ForcedSubject<'event'>)]
  | ['create', 'booking' | 'event']
  | ['edit', 'booking' | 'event']
  | ['getBackend', 'eventId' | (EventID & ForcedSubject<'eventId'>)]
  | ['viewRoles', 'eventId' | (EventID & ForcedSubject<'eventId'>)]
  | ['create', 'role' | (TRoleForForm & ForcedSubject<'role'>)]
  | ['delete', 'role' | (TRoleForForm & ForcedSubject<'role'>)]
  | ['createSheet' | 'getSheetData' | 'cancelBooking', 'eventBookingIds' | ({ eventId: string; userId: string } & ForcedSubject<'eventBookingIds'>)]

const lambdaMatcher: ConditionsMatcher<MatchConditions> = (matchConditions) => matchConditions

//type abilities = ['manage', 'all'] | ['get', 'currentUser'] | ['get', 'env']

export const getPermissionsFromUser = (user: ContextUser) => {
  const { can, cannot, build } = new AbilityBuilder<PureAbility<Abilities, MatchConditions>>(createMongoAbility)
  //new AbilityBuilder<PureAbility<abilities, MatchConditions>>(createMongoAbility)

  cannot('manage', 'all')
  can('get', 'currentUser')
  can('get', 'env')
  can('get', 'events')
  can('get', 'ownBookings')

  if (!user) {
    return build()
    //return build({conditionsMatcher: lambdaMatcher})
  }

  //edit own bookings
  can('update', 'eventBooking', ({ booking: b }) => b.userId === user.userId)
  can('cancelBooking', 'eventBookingIds', (ids) => ids.userId === user.userId)

  //get the sheet for own bookings
  can('getSheet', 'eventBooking', ({ booking: b }) => b.userId === user.userId)
  can('createSheet', 'eventBookingIds', (ids) => ids.userId === user.userId)
  can('getSheetData', 'eventBookingIds', (ids) => ids.userId === user.userId)

  //book into an event
  can('book', 'event', (e) => e.bigCampMode === false && dayjs(e.bookingDeadline).isAfter(new Date()))

  for (const role of user.roles) {
    permissionsFunctions[role.role](can)
  }

  return build({ conditionsMatcher: lambdaMatcher })
}

const permissionsFunctions: Record<TRole['role'], (can: AbilityBuilder<PureAbility<Abilities, MatchConditions>>['can']) => void> = {
  admin: (can) => {
    can('create', 'event')
    can('edit', 'event')
    can('getBackend', 'eventId', (e) => true)
    can('viewRoles', 'eventId', (e) => true)
    can('get', 'users')
    can('create', 'role', (r) => true)
    can('delete', 'role', (r) => true)
  },
  owner: (can) => {},
}
