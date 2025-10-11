import { PersonField } from '../personFields';
import { TEvent, TEventAttendanceUnion } from '../schemas/event'
import { TPerson } from '../schemas/person';

export type AttendanceBookingFormDisplayElement<A extends TEventAttendanceUnion> = React.FC<{ index: number; event: TEvent<any, any, A, any> }>
export type AttendancePersonCardElement<A extends TEventAttendanceUnion> = React.FC<{ person: TPerson<TEvent<any, any, any, any>>; event: TEvent<any, any, A, any> }>


export interface AttendanceStructure<A extends TEventAttendanceUnion = TEventAttendanceUnion> {
  typeName: A['attendanceStructure']
  name: string
  getDefaultData: (event: TEvent<any, any, A, any>) => TPerson<TEvent<any, any, any, any>>['attendance']
  BookingFormDisplayElement: AttendanceBookingFormDisplayElement<A>
  PersonFields: (event: TEvent<any, any, A, any>) => PersonField<TEvent<any, any, A, any>>[]
  PersonCardElement: AttendancePersonCardElement<A>
}
