import { PersonField } from '../personFields'
import { TBooking } from '../schemas/booking'
import { EventSchema, TEvent, TEventBasicKP, TEventKPUnion, TEventLargeKP } from '../schemas/event'
import { TPerson, TPersonBasicKPData, TPersonLargeKPData } from '../schemas/person'
import { BasicKP } from './basic'
import { LargeKP } from './large'

export type KPTypes = TEvent['kp']['kpStructure']

export type ManageKPPageList<KP extends TEventKPUnion> = React.FC<{ event: TEvent<KP>; campers: TPerson[] }>

export type KPPersonCardSection<KP extends TEventKPUnion> = React.FC<{ person: TPerson<TEvent<KP>> }>

export interface KPStructure<T extends TEventKPUnion = TEventKPUnion> {
  typeName: T['kpStructure']
  PersonFormSection: React.FC<{ index: number }>
  ManageKPPageList: ManageKPPageList<T>
  PersonCardSection: KPPersonCardSection<T>
  PersonFields: (event: TEvent<T>) => PersonField<TEvent<T>>[]
}


export const KPBasicOptions = ['omnivore', 'pescatarian', 'vegetarian', 'vegan'] as const
export type TKPBasicOptions = (typeof KPBasicOptions)[number]

export const KPOptions = EventSchema.shape.kp.options.map((option) => option.shape.kpStructure.value)
const KPTypes: KPStructure[] = [new BasicKP() as KPStructure, new LargeKP() as KPStructure]

export const maybeGetKPType = (kpStructure: KPTypes | undefined): KPStructure | undefined => {
  if (!kpStructure) return undefined
  const kpType = KPTypes.find((kp) => kp.typeName === kpStructure)
  if (!kpType) return undefined
  return kpType
}

export const getKPType = (event: TEvent): KPStructure => {
  const kpStructure = event.kp.kpStructure
  return maybeGetKPType(kpStructure) || new BasicKP() as KPStructure
}
