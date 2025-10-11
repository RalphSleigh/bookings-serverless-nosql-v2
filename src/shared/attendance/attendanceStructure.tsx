import { TEvent, TEventAttendanceUnion } from '../schemas/event'
import { TPerson } from '../schemas/person';

export type AttendanceBookingFormDisplayElement<A extends TEventAttendanceUnion> = React.FC<{ index: number; event: TEvent<any, any, A, any> }>

export interface AttendanceStructure<A extends TEventAttendanceUnion = TEventAttendanceUnion> {
  typeName: A['attendanceStructure']
  name: string
  getDefaultData: (event: TEvent<any, any, A, any>) => TPerson<TEvent<any, any, A, any>>['attendance']
  BookingFormDisplayElement: AttendanceBookingFormDisplayElement<A>
}
