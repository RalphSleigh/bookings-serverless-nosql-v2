import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime.js'
import { getProperty } from 'dot-prop'
import { MRT_ColumnDef } from 'mantine-react-table'

import { TBooking } from './schemas/booking'
import { TEvent } from './schemas/event'
import { TPerson } from './schemas/person'
import { TRole } from './schemas/role'
import { ageGroupFromPerson } from './woodcraft'
import { TBookingResponse } from '../lambda/endpoints/event/manage/getEventBookings'

dayjs.extend(relativeTime)

type CellType = MRT_ColumnDef<TBookingResponse>['Cell']

abstract class BookingField {
  event: TEvent
  abstract name: string
  enabled: (event: TEvent) => boolean = () => true
  enabledForDrive: (event: TEvent) => boolean = () => true
  abstract accessor: string | ((p: TBookingResponse) => string | Date)
  hideByDefault: boolean = false
  filterVariant: 'text' | 'date-range' = 'text'
  Cell?: CellType
  size: number = 100
  roles: TRole['role'][] = ['owner']
  available: (roles: TRole[]) => boolean = (roles) => roles.some((role) => this.roles.includes(role.role))
  titleForDrive: () => string = () => this.name
  valueForDrive: (b: TBookingResponse) => string = (b) => {
    if (typeof this.accessor === 'function') {
      const v = this.accessor(b)
      return typeof v === 'string' ? v : v.toLocaleDateString()
    } else {
      const v = getProperty<TBookingResponse, string, string>(b, this.accessor, '')
      return v
    }
  }

  constructor(event: TEvent) {
    this.event = event
  }

  bookingTableDef = () => {
    const def = {
      header: this.name,
      filterVariant: this.filterVariant,
      size: this.size,
      minSize: 20,
    } as MRT_ColumnDef<TBookingResponse>

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

class Name extends BookingField {
  name = 'Name'
  accessor = 'basic.name'
}

class Email extends BookingField {
  name = 'Email'
  accessor = 'basic.email'
}

class Phone extends BookingField {
  name = 'Phone'
  accessor = 'basic.telephone'
}

class PeopleCount extends BookingField {
  name = 'People'
  size = 20
  accessor = (b: TBookingResponse) => b.people.filter((p) => !p.cancelled).length.toString()
}

class EditLink extends BookingField {
  name = 'Edit'
  size = 50
  enabledForDrive = () => false
  accessor = (b: TBookingResponse) => `/event/${b.eventId}/booking/${b.userId}/update`
  Cell: CellType = ({ cell }) => <a href={cell.getValue<string>()}>Edit</a>
}

class Created extends BookingField {
  name = 'Created'
  filterVariant = 'date-range' as const
  accessor = (b: TBookingResponse) => new Date(b.createdAt!)
  Cell: CellType = ({ cell }) => dayjs(cell.getValue<Date>()).fromNow()
}

class Updated extends BookingField {
  name = 'Updated'
  filterVariant = 'date-range' as const
  accessor = (b: TBookingResponse) => new Date(b.updatedAt!)
  Cell: CellType = ({ cell }) => dayjs(cell.getValue<Date>()).fromNow()
}

export const bookingFields: (event: TEvent) => BookingField[] = (event) => {
  return [new Name(event), new Email(event), new Phone(event), new PeopleCount(event), new EditLink(event), new Created(event), new Updated(event)]
}
