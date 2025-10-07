import { TBooking } from '../schemas/booking'
import { EventSchema, TEvent, TEventKPUnion } from '../schemas/event'
import { TPersonBasicKPData, TPersonLargeKPData } from '../schemas/person'
import { BasicKP } from './basic'
import { LargeKP } from './large'

export type KPTypes = TEvent['kp']['kpStructure']
export interface KPStructure<T extends TEventKPUnion = TEventKPUnion> {
  typeName: T['kpStructure']
  ManageKPPageList: React.FC<{ event: TEvent<T>; bookings: TBooking<TEvent<T>>[] }>
}

export const KPBasicOptions = ['omnivore', 'pescatarian', 'vegetarian', 'vegan'] as const
export type TKPBasicOptions = (typeof KPBasicOptions)[number]

export const KPOptions = EventSchema.shape.kp.options.map((option) => option.shape.kpStructure.value)
const KPTypes = [BasicKP, LargeKP]

export const maybeGetKPType = (kpStructure: KPTypes | undefined): KPStructure<any> | undefined => {
  if (!kpStructure) return undefined
  const kpType = KPTypes.find((kp) => new kp().typeName === kpStructure)
  if (!kpType) return undefined
  return new kpType()
}

export const getKPType = (event: TEvent): KPStructure<any> => {
  const kpStructure = event.kp.kpStructure
  return maybeGetKPType(kpStructure) || new BasicKP()
}
