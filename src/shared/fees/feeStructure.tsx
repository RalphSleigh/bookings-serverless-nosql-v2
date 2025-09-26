import { Dispatch, SetStateAction } from 'react';
import { PartialDeep } from 'type-fest';

import { AttendanceTypes } from '../attendance/attendance';
import { TEvent, TEventWithFees, TFees } from '../schemas/event';
import { PartialBookingType, TBooking, TBookingForType } from '../schemas/booking';
import { TFee } from '../schemas/fees';

export type FeeStructureConfigData<T extends TFees> = Required<Pick<T, 'feeStructure'>> & PartialDeep<T>;
export type FeeStructureCondfigurationElement<T extends TFees> = React.FC<{
  //data: FeeStructureConfigData<T>;
  //update: Dispatch<SetStateAction<PartialDeep<T>>>;
}>;

export type BookingFormDisplayElement<T  extends TFees> = React.FC<{event: TEventWithFees<T>}>

export type FeeLine = {
  label: string;
  amount: number;
}

export type EventListDisplayElement<T  extends TFees> = React.FC<{event: TEventWithFees<T>, booking: TBooking, fees: TFee[]}>

export type GetFeeLineFunction<T extends TFees> = (event: TEventWithFees<T>, booking: PartialBookingType) => FeeLine[];

export type EmailElement<T extends TFees> = React.FC<{event: TEventWithFees<T>, booking: TBookingForType}>

export interface FeeStructure<T extends TFees = TFees> {
  typeName: T['feeStructure']
  name: string;
  supportedAttendance: AttendanceTypes[];
  getFeeLines: GetFeeLineFunction<T>;
  ConfigurationElement: FeeStructureCondfigurationElement<T>;
  BookingFormDisplayElement: BookingFormDisplayElement<T>;
  EventListDisplayElement: EventListDisplayElement<T>;
  EmailElement: EmailElement<T>;
}
