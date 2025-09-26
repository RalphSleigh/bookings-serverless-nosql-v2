import dayjs from 'dayjs'

import { TEvent } from './schemas/event'
import { TPerson } from './schemas/person'
import { ageGroupFromPerson } from './woodcraft'
import { MRT_ColumnDef } from 'mantine-react-table'
import { TBooking } from './schemas/booking'

type CellType = MRT_ColumnDef<TBooking>['Cell']

abstract class BookingField {
  event: TEvent
  abstract name: string
  enabled: (event: TEvent) => boolean = () => true
  abstract accessor: string | ((p: TBooking) => string | Date)
  hideByDefault: boolean = false
  filterVariant: 'text' | 'date-range' = 'text'
  Cell?: CellType

  constructor(event: TEvent) {
    this.event = event
  }

bookingTableDef = () => {
    const def = {
        header: this.name,
        filterVariant: this.filterVariant,
    } as MRT_ColumnDef<TBooking>


    if (typeof this.accessor === 'function') {
        def.accessorFn = this.accessor
        def.id = this.name
    } else {
        def.accessorKey = this.accessor
    }

    if(this.Cell) {
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
  accessor = (b: TBooking) => b.people.length.toString()
}

class EditLink extends BookingField {
    name = 'Edit'
    accessor = (b: TBooking) => `/event/${b.eventId}/booking/${b.userId}/update`
    Cell: CellType = ({ cell }) => <a href={cell.getValue<string>()}>Edit</a>
}



export const bookingFields: (event: TEvent) => BookingField[] = (event) => {
  return [new Name(event), new Email(event), new Phone(event), new PeopleCount(event), new EditLink(event)]
}
