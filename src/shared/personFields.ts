import dayjs from 'dayjs'

import { TEvent } from './schemas/event'
import { TPerson } from './schemas/person'
import { ageGroupFromPerson } from './woodcraft'
import { MRT_ColumnDef } from 'mantine-react-table'

type CellType = MRT_ColumnDef<TPerson>['Cell']

abstract class PersonField {
  event: TEvent
  abstract name: string
  enabled: (event: TEvent) => boolean = () => true
  abstract accessor: string | ((p: TPerson) => string | Date)
  hideByDefault: boolean = false
  filterVariant: 'text' | 'date-range' = 'text'
  Cell?: CellType

  constructor(event: TEvent) {
    this.event = event
  }

  personTableDef = () => {
    const def = {
        header: this.name,
        filterVariant: this.filterVariant,
    } as MRT_ColumnDef<TPerson>


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

class Name extends PersonField {
  name = 'Name'
  accessor = 'basic.name'
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
}

class DietDetails extends PersonField {
    name = 'Diet Details'
    accessor = 'kp.details'
}

class Medical extends PersonField {
    name = 'Medical'
    accessor = 'health.medical'
}

export const personFields: (event: TEvent) => PersonField[] = (event) => {
  return [new Name(event), new Email(event), new Dob(event), new Age(event), new Diet(event), new DietDetails(event), new Medical(event)]
}
