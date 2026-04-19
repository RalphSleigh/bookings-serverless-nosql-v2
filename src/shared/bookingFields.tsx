import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime.js'
import { getProperty } from 'dot-prop'
import { MRT_ColumnDef } from 'mantine-react-table'

import { TBookingResponse } from '../lambda/endpoints/event/manage/getEventBookings'
import { TBooking } from './schemas/booking'
import { TEvent } from './schemas/event'
import { TPerson } from './schemas/person'
import { TRole } from './schemas/role'
import { ageGroupFromPerson } from './woodcraft'
import { getFeeType } from './fees/fees'
import { TVillages } from './schemas/villages'

dayjs.extend(relativeTime)

type CellType = MRT_ColumnDef<TBookingResponse>['Cell']

abstract class BookingField {
  event: TEvent
  villages?: TVillages
  abstract name: string
  enabled: (event: TEvent) => boolean = () => true
  enabledForDrive: (event: TEvent) => boolean = () => true
  abstract accessor: string | ((p: TBookingResponse) => string | Date)
  hideByDefault: boolean = false
  filterVariant: 'text' | 'date-range' = 'text'
  Cell?: CellType
  size: number = 100
  roles: TRole['role'][] = ['owner', 'manager', 'viewer', 'comms', 'finance']
  available: (roles: TRole[]) => boolean = (roles) => roles.some((role) => this.roles.includes(role.role) && role.eventId === this.event.eventId)
  titleForDrive: () => string = () => this.name
  valueForDrive: (b: TBookingResponse) => string = (b) => {
    if (typeof this.accessor === 'function') {
      const v = this.accessor(b)
      return typeof v === 'string' ? v : v.toLocaleString('en-GB')
    } else {
      const v = getProperty<TBookingResponse, string, string>(b, this.accessor, '')
      return v
    }
  }

  constructor(event: TEvent, villages?: TVillages) {
    this.event = event
    this.villages = villages
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

class BookingType extends BookingField {
  name = 'Booking Type'
  enabled: (event: TEvent) => boolean = (event) => event.bigCampMode
  accessor = (b: TBookingResponse) => ('type' in b.basic ? b.basic.type : '')
}

class District extends BookingField {
  name = 'District'
  enabled: (event: TEvent) => boolean = (event) => event.bigCampMode
  accessor = (b: TBookingResponse) => ('district' in b.basic ? b.basic.district || '' : '')
}

class Village extends BookingField {
  name = 'Village'
  enabled: (event: TEvent) => boolean = (event) => !!this.villages && this.villages.villages.length > 0
  accessor = (b: TBookingResponse) => {
    if (!this.villages) return ''
    const village = this.villages.villages.find((v) => v.bookings.includes(b.userId))
    return village ? village.name : ''
  }
}


class PeopleCount extends BookingField {
  name = 'People'
  size = 20
  accessor = (b: TBookingResponse) => b.people.filter((p) => !p.cancelled).length.toString()
}

class Shuttle extends BookingField {
  name = 'Shuttle'
  size = 20

  accessor = (b: TBookingResponse) => ('shuttle' in b.other ? b.other.shuttle : 'N/A')
}

class AnythingElse extends BookingField {
  name = 'Anything Else'
  size = 150
  enabled: (event: TEvent) => boolean = (event) => event.bigCampMode
  accessor = (b: TBookingResponse) => b.other.anythingElse || ''
}

class CampsWith extends BookingField {
  name = 'Camps With'
  size = 150
  enabled: (event: TEvent) => boolean = (event) => event.bigCampMode
  accessor = (b: TBookingResponse) => (b.camping && 'who' in b.camping ? (b.camping.who ?? '') : '')
}

class Equipment extends BookingField {
  name = 'Equipment'
  size = 150
  enabled: (event: TEvent) => boolean = (event) => event.bigCampMode
  accessor = (b: TBookingResponse) => (b.camping && 'equipment' in b.camping ? (b.camping.equipment ?? '') : '')
}

class AccessibilityRequirements extends BookingField {
  name = 'Accessibility Requirements'
  size = 150
  enabled: (event: TEvent) => boolean = (event) => event.bigCampMode
  accessor = (b: TBookingResponse) => (b.camping && 'accessibility' in b.camping ? (b.camping.accessibility ?? '') : '')
}

class EditLink extends BookingField {
  name = 'Edit'
  size = 50
  enabledForDrive = () => false
  roles: TRole['role'][] = ['owner', 'manager']
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

class PaymentReference extends BookingField {
  name = 'Payment Reference'
  enabled: (event: TEvent) => boolean = (event) => event.fee.feeStructure === 'vcamp'
  accessor = (b: TBookingResponse) => {
    const fees = getFeeType(this.event)
    return fees.getPaymentReference(b)
  }
}

export const bookingFields: (event: TEvent, villages?: TVillages) => BookingField[] = (event, villages) => {
  return [
    new BookingType(event),
    new Name(event),
    new District(event),
    new Email(event),
    new Phone(event),
    new Village(event, villages),
    new PeopleCount(event),
    new Shuttle(event),
    new AnythingElse(event),
    new CampsWith(event),
    new Equipment(event),
    new AccessibilityRequirements(event),
    new PaymentReference(event),
    new EditLink(event),
    new Created(event),
    new Updated(event),
  ]
}
