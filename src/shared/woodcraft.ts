import dayjs from 'dayjs'

import { TEvent } from './schemas/event'
import { TPerson } from './schemas/person'

export class AgeGroup {
  singular: string
  plural: string
  age: number

  constructor(singular: string, plural: string, age: number) {
    this.singular = singular
    this.plural = plural
    this.age = age
  }

  toAgeGroupString() {
    return this.age < 22 ? `${this.singular} (${this.age})` : `${this.singular}`
  }
}

type AgeGroupFilter = {
  filter: (age: number) => boolean
  construct: (age: number) => AgeGroup
}

export const ageGroups: AgeGroupFilter[] = [
  {
    filter: (age: number) => age < 6,
    construct: (age: number) => new AgeGroup('Woodchip', 'Woodchips', age),
  },
  {
    filter: (age: number) => age >= 6 && age < 10,
    construct: (age: number) => new AgeGroup('Elfin', 'Elfins', age),
  },
  {
    filter: (age: number) => age >= 10 && age < 13,
    construct: (age: number) => new AgeGroup('Pioneer', 'Pioneers', age),
  },
  {
    filter: (age: number) => age >= 13 && age < 16,
    construct: (age: number) => new AgeGroup('Venturer', 'Venturers', age),
  },
  {
    filter: (age: number) => age >= 16 && age < 18,
    construct: (age: number) => new AgeGroup('DF u18', 'DFs u18', age),
  },
  {
    filter: (age: number) => age >= 18 && age < 21,
    construct: (age: number) => new AgeGroup('DF 18+', 'DFs 18+', age),
  },
  {
    filter: (age: number) => age >= 21,
    construct: (age: number) => new AgeGroup('Adult', 'Adults', age),
  },
]

export const ageGroupFromPerson =
  (event: TEvent) =>
  (person: TPerson): AgeGroup => {
    const age = dayjs(event.endDate).diff(dayjs(person.basic.dob), 'year')
    const ageGroupFilter = ageGroups.find((ag) => ag.filter(age))
    return ageGroupFilter ? ageGroupFilter.construct(age) : ageGroups[ageGroups.length - 1].construct(age)
  }

export const campersInAgeGroup =
  (event: TEvent) =>
  (ageGroup: AgeGroupFilter) =>
  (person: TPerson): boolean => {
    const age = dayjs(event.endDate).diff(dayjs(person.basic.dob), 'year')
    return ageGroup.filter(age)
  }
