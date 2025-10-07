import { Dispatch, SetStateAction } from 'react'
import { PartialDeep } from 'type-fest'

import { AttendanceTypes } from '../attendance/attendance'
import { PartialBookingType, TBooking, TBookingForType } from '../schemas/booking'
import { TEvent, TEventFeesUnion } from '../schemas/event'
import { TFee } from '../schemas/fees'

export type FeeStructureConfigData<T extends TEventFeesUnion> = Required<Pick<T, 'feeStructure'>> & PartialDeep<T>
export type FeeStructureCondfigurationElement<T extends TEventFeesUnion> = React.FC<{
  //data: FeeStructureConfigData<T>;
  //update: Dispatch<SetStateAction<PartialDeep<T>>>;
}>

export type BookingFormDisplayElement<T extends TEventFeesUnion> = React.FC<{ event: TEvent<any, any, any, T> }>

export type FeeLine = {
  label: string
  amount: number
}

export type EventListDisplayElement<T extends TEventFeesUnion> = React.FC<{ event: TEvent<any, any, any, T>; booking: TBooking; fees: TFee[] }>

export type GetFeeLineFunction<T extends TEventFeesUnion> = (event: TEvent<any, any, any, T>, booking: PartialBookingType) => FeeLine[]

export type EmailElement<T extends TEventFeesUnion> = React.FC<{ event: TEvent<any, any, any, T>; booking: TBookingForType }>

export interface FeeStructure<T extends TEventFeesUnion = TEventFeesUnion> {
  typeName: T['feeStructure']
  name: string
  supportedAttendance: AttendanceTypes[]
  getFeeLines: GetFeeLineFunction<T>
  ConfigurationElement: FeeStructureCondfigurationElement<T>
  BookingFormDisplayElement: BookingFormDisplayElement<T>
  EventListDisplayElement: EventListDisplayElement<T>
  EmailElement: EmailElement<T>
}
