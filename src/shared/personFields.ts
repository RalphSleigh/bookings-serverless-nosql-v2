import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime.js'
import { getProperty } from 'dot-prop'
import { MRT_ColumnDef } from 'mantine-react-table'

import { getAttendanceType } from './attendance/attendance'
import { TEvent } from './schemas/event'
import { TPerson } from './schemas/person'
import { TRole } from './schemas/role'
import { ageGroupFromPerson } from './woodcraft'
import { getKPType } from './kp/kp'

dayjs.extend(relativeTime)

export abstract class PersonField<T extends TEvent = TEvent> {
  event: TEvent
  abstract name: string
  enabledForDrive: (event: TEvent) => boolean = () => true
  enabled: (event: TEvent) => boolean = () => true
  abstract accessor: string | ((p: TPerson<T>) => string | Date | boolean | number)
  hideByDefault: boolean = false
  filterVariant: 'text' | 'date-range' = 'text'
  Cell?: MRT_ColumnDef<TPerson<T>>['Cell']
  size: number = 100
  roles: TRole['role'][] = ['owner', 'manager', 'viewer']
  available: (roles: TRole[]) => boolean = (roles) => roles.some((role) => this.roles.includes(role.role))
  titleForDrive: () => string = () => this.name
  valueForDrive: (p: TPerson<T>) => string = (p) => {
    if (typeof this.accessor === 'function') {
      const v = this.accessor(p)
      switch (typeof v) {
        case 'string':
          return v
        case 'boolean':
          return v.toString()
        case 'object':
          return v.toLocaleDateString()
        case 'number':
          return v.toString()
      }
    } else {
      const v = getProperty<TPerson<T>, string, string>(p, this.accessor, '')
      return v
    }
  }
  sortingFn?: MRT_ColumnDef<TPerson<T>>['sortingFn']

  constructor(event: TEvent) {
    this.event = event
  }

  personTableDef = () => {
    const def = {
      header: this.name,
      filterVariant: this.filterVariant,
      size: this.size,
      minSize: 20,
    } as MRT_ColumnDef<TPerson<T>>

    if (this.sortingFn) {
      def.sortingFn = this.sortingFn
    }

    if (typeof this.accessor === 'function') {
      def.accessorFn = this.accessor
      def.id = this.name
    } else {
      def.accessorKey = this.accessor
    }

    if (this.Cell) {
      def.Cell = this.Cell
    }

    return def
  }
}

class Name extends PersonField {
  name = 'Name'
  accessor = 'basic.name'
  size = 150
}

class Email extends PersonField {
  name = 'Email'
  accessor = 'basic.email'
  enabled = (event: TEvent) => event.allParticipantEmails
}

class Dob extends PersonField {
  name = 'DoB'
  accessor = (p: TPerson) => new Date(p.basic.dob)
  hideByDefault = true
  filterVariant = 'date-range' as const
  Cell: MRT_ColumnDef<TPerson>['Cell'] = ({ cell }) => cell.getValue<Date>().toLocaleDateString()
  size: number = 100
}

class Age extends PersonField {
  name = 'Age Group'
  accessor = (p: TPerson) => {
    const age = dayjs(this.event.endDate).diff(dayjs(p.basic.dob), 'year')
    const group = ageGroupFromPerson(this.event)(p)
    return group.toAgeGroupString()
  }
  size: number = 130
  sortingFn: MRT_ColumnDef<TPerson>['sortingFn'] = (a, b, id) => {
    return new Date(a.original.basic.dob).getTime() - new Date(b.original.basic.dob).getTime()
  }
}

class Medical extends PersonField {
  name = 'Medical'
  accessor = (p: TPerson) => p.health?.medical || ''
}

class Created extends PersonField {
  name = 'Created'
  filterVariant = 'date-range' as const
  accessor = (p: TPerson) => new Date(p.createdAt!)
  Cell: MRT_ColumnDef<TPerson>['Cell'] = ({ cell }) => dayjs(cell.getValue<Date>()).fromNow()
}

class Updated extends PersonField {
  name = 'Updated'
  filterVariant = 'date-range' as const
  accessor = (p: TPerson) => new Date(p.updatedAt!)
  Cell: MRT_ColumnDef<TPerson>['Cell'] = ({ cell }) => dayjs(cell.getValue<Date>()).fromNow()
}

export class Current extends PersonField {
  name = 'Current'
  accessor = (p: TPerson) => !p.cancelled
}

export const personFields = <E extends TEvent>(event: E): PersonField<E>[]  => {
  const attendance = getAttendanceType(event)
  const kp = getKPType(event)
  return [
    new Name(event),
    new Email(event),
    new Dob(event),
    new Age(event),
    ...kp.PersonFields(event),
    new Medical(event),
    ...attendance.PersonFields(event),
    new Created(event),
    new Updated(event),
  ]
}
