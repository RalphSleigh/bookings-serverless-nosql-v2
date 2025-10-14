import { EventSchema, TEvent, TEventConsentsUnion } from '../schemas/event'
import { NoneConsents } from './none'
import { VCampConsents } from './vcamp'

export type ConsentsTypes = TEvent['consents']['consentsStructure']

export type ConsentPersonFormSection = React.FC<{ index: number }>


export interface ConsentStructure<C extends TEventConsentsUnion = TEventConsentsUnion> {
  typeName: ConsentsTypes
  FormSection: ConsentPersonFormSection
}

export const ConsentsOptions = EventSchema.shape.consents.options.map((option) => option.shape.consentsStructure.value)

const ConsentTypes: ConsentStructure[] = [new NoneConsents() as ConsentStructure, new VCampConsents() as ConsentStructure]

export const maybeGetConsentsType = (consentsStructure: ConsentsTypes | undefined): ConsentStructure | undefined => {
  if (!consentsStructure) return undefined
  const consentsType = ConsentTypes.find((consent) => consent.typeName === consentsStructure)
  if (!consentsType) return undefined
  return consentsType
}

export const getConsentsType = (event: TEvent): ConsentStructure => {
  const consentsStructure = event.consents.consentsStructure
  return maybeGetConsentsType(consentsStructure) || (new NoneConsents() as ConsentStructure)
}
