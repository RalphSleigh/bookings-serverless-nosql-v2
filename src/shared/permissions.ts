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
  | ['get', 'events' | 'event' | 'currentUser' | 'env' | 'ownBookings' | 'users' | 'errors']
  | ['update', 'userPreferences' | 'eventBooking' | ({ event: TEvent; booking: TBooking } & ForcedSubject<'eventBooking'>)]
  | ['book' | 'apply', 'event' | (TEvent & ForcedSubject<'event'>)]
  | ['create', 'booking' | 'event']
  | ['edit', 'booking' | 'event']
  | ['getBackend' | 'getFees' | 'createFee' | 'getApplications' | 'approveApplication', 'eventId' | (EventID & ForcedSubject<'eventId'>)]
  | ['viewRoles', 'eventId' | (EventID & ForcedSubject<'eventId'>)]
  | ['create', 'role' | (TRoleForForm & ForcedSubject<'role'>)]
  | ['delete', 'role' | (TRoleForForm & ForcedSubject<'role'>)]
  | ['getSheet' | 'createSheet' | 'getSheetData' | 'cancelBooking', 'eventBookingIds' | ({ eventId: string; userId: string } & ForcedSubject<'eventBookingIds'>)]

const lambdaMatcher: ConditionsMatcher<MatchConditions> = (matchConditions) => matchConditions

//type abilities = ['manage', 'all'] | ['get', 'currentUser'] | ['get', 'env']

export const getPermissionsFromUser = (user: ContextUser) => {
  const { can, cannot, build } = new AbilityBuilder<PureAbility<Abilities, MatchConditions>>(createMongoAbility)
  //new AbilityBuilder<PureAbility<abilities, MatchConditions>>(createMongoAbility)

  cannot('manage', 'all')
  can('get', 'errors')
  can('get', 'currentUser')
  can('get', 'env')
  can('get', 'events')
  can('get', 'ownBookings')

  if (!user) {
    return build()
    //return build({conditionsMatcher: lambdaMatcher})
  }

  can('update', 'userPreferences')

  //edit own bookings
  can('update', 'eventBooking', ({ booking: b }) => b.userId === user.userId)
  can('cancelBooking', 'eventBookingIds', (ids) => ids.userId === user.userId)

  //get the sheet for own bookings
  can('getSheet', 'eventBookingIds', (ids) => ids.userId === user.userId)
  can('createSheet', 'eventBookingIds', (ids) => ids.userId === user.userId)
  can('getSheetData', 'eventBookingIds', (ids) => ids.userId === user.userId)

  //book into an event
  can('book', 'event', (e) => dayjs(e.bookingDeadline).isAfter(new Date()))
  //apply to an event
  can('apply', 'event', (e) => e.applicationsRequired)

  for (const role of user.roles) {
    permissionsFunctions[role.role](can, role)
  }

  return build({ conditionsMatcher: lambdaMatcher })
}

const permissionsFunctions: Record<TRole['role'], (can: AbilityBuilder<PureAbility<Abilities, MatchConditions>>['can'], role: TRole) => void> = {
  admin: (can, role) => {
    can('create', 'event')
    can('edit', 'event')
    can('getBackend', 'eventId', (e) => true)
    can('viewRoles', 'eventId', (e) => true)
    can('get', 'users')
    can('create', 'role', (r) => true)
    can('delete', 'role', (r) => true)
    can('getFees', 'eventId', (e) => true)
    can('createFee', 'eventId', (e) => true)
    can('getApplications', 'eventId', (e) => true)
    can('approveApplication', 'eventId', (e) => true)
    can('update', 'eventBooking', (b) => true)

    can('getSheet', 'eventBookingIds', (ids) => true)
    can('createSheet', 'eventBookingIds', (ids) => true)
    can('getSheetData', 'eventBookingIds', (ids) => true)
  },
  owner: (can, role) => {
    can('getBackend', 'eventId', (e) => e.eventId === role.eventId)
    can('viewRoles', 'eventId', (e) => e.eventId === role.eventId)
    can('get', 'users')
    can('create', 'role', (r) => r.eventId === role.eventId)
    can('delete', 'role', (r) => r.eventId === role.eventId)
    can('getFees', 'eventId', (e) => e.eventId === role.eventId)
    can('createFee', 'eventId', (e) => e.eventId === role.eventId)
    can('getApplications', 'eventId', (e) => e.eventId === role.eventId)
    can('approveApplication', 'eventId', (e) => e.eventId === role.eventId)
    can('update', 'eventBooking', (b) => b.event.eventId === role.eventId && b.booking.eventId === role.eventId)

    can('getSheet', 'eventBookingIds', (ids) => ids.eventId === role.eventId)
    can('createSheet', 'eventBookingIds', (ids) => ids.eventId === role.eventId)
    can('getSheetData', 'eventBookingIds', (ids) => ids.eventId === role.eventId)
  },
  manager: (can, role) => {
    can('getBackend', 'eventId', (e) => e.eventId === role.eventId)
    can('viewRoles', 'eventId', (e) => e.eventId === role.eventId)
    can('get', 'users')
    can('create', 'role', (r) => r.eventId === role.eventId && r.role !== 'owner')
    can('delete', 'role', (r) => r.eventId === role.eventId && r.role !== 'owner')
    can('getFees', 'eventId', (e) => e.eventId === role.eventId)
    can('createFee', 'eventId', (e) => e.eventId === role.eventId)
    can('getApplications', 'eventId', (e) => e.eventId === role.eventId)
    can('approveApplication', 'eventId', (e) => e.eventId === role.eventId)
    can('update', 'eventBooking', (b) => b.event.eventId === role.eventId && b.booking.eventId === role.eventId)

    can('getSheet', 'eventBookingIds', (ids) => ids.eventId === role.eventId)
    can('createSheet', 'eventBookingIds', (ids) => ids.eventId === role.eventId)
    can('getSheetData', 'eventBookingIds', (ids) => ids.eventId === role.eventId)
  },
  viewer: (can, role) => {
    can('getBackend', 'eventId', (e) => e.eventId === role.eventId)
  }
}
