import dayjs from 'dayjs'
import { getProperty } from 'dot-prop'
import { MRT_ColumnDef } from 'mantine-react-table'

import { TEvent } from './schemas/event'
import { TPerson } from './schemas/person'
import { TRole } from './schemas/role'
import { ageGroupFromPerson } from './woodcraft'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime);

type CellType = MRT_ColumnDef<TPerson>['Cell']

abstract class PersonField {
  event: TEvent
  abstract name: string
  enabledForDrive: (event: TEvent) => boolean = () => true
  enabled: (event: TEvent) => boolean = () => true
  abstract accessor: string | ((p: TPerson) => string | Date | boolean)
  hideByDefault: boolean = false
  filterVariant: 'text' | 'date-range' = 'text'
  Cell?: CellType
  size: number = 100
  roles: TRole['role'][] = ['owner']
  available: (roles: TRole[]) => boolean = (roles) => roles.some((role) => this.roles.includes(role.role))
  titleForDrive: () => string = () => this.name
  valueForDrive: (p: TPerson) => string = (p) => {
    if (typeof this.accessor === 'function') {
      const v = this.accessor(p)
      return typeof v === 'string' ? v : typeof v === 'boolean' ? v.toString() : v.toLocaleDateString()
    } else {
      const v = getProperty<TPerson, string, string>(p, this.accessor, '')
      return v
    }
  }

  constructor(event: TEvent) {
    this.event = event
  }

  personTableDef = () => {
    const def = {
      header: this.name,
      filterVariant: this.filterVariant,
      size: this.size,
      minSize: 20,
    } as MRT_ColumnDef<TPerson>

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
  Cell: CellType = ({ cell }) => cell.getValue<Date>().toLocaleDateString()
  size: number = 40
}

class Age extends PersonField {
  name = 'Age Group'
  accessor = (p: TPerson) => {
    const age = dayjs(this.event.endDate).diff(dayjs(p.basic.dob), 'year')
    const group = ageGroupFromPerson(this.event)(p)
    return age < 21 ? `${group.singular} (${age})` : `${group.singular}`
  }
}

class Diet extends PersonField {
  name = 'Diet'
  accessor = 'kp.diet'
  size: number = 40
}

class DietDetails extends PersonField {
  name = 'Diet Details'
  accessor = 'kp.details'
}

class Medical extends PersonField {
  name = 'Medical'
  accessor = 'health.medical'
}

class Created extends PersonField {
  name = 'Created'
  filterVariant = 'date-range' as const
  accessor = (p: TPerson) => new Date(p.createdAt!)
  Cell: CellType = ({ cell }) => dayjs(cell.getValue<Date>()).fromNow()
}

class Updated extends PersonField {
  name = 'Updated'
  filterVariant = 'date-range' as const
  accessor = (p: TPerson) => new Date(p.updatedAt!)
  Cell: CellType = ({ cell }) => dayjs(cell.getValue<Date>()).fromNow()
}

export class Current extends PersonField {
  name = 'Current'
  accessor = (p: TPerson) => !p.cancelled
}

export const personFields: (event: TEvent) => PersonField[] = (event) => {
  return [new Name(event), new Email(event), new Dob(event), new Age(event), new Diet(event), new DietDetails(event), new Medical(event), new Created(event), new Updated(event)]
}
