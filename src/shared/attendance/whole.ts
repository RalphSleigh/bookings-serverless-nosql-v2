import { TEvent, TEventWholeAttendance } from "../schemas/event";
import { TPerson } from "../schemas/person";
import { AttendanceBookingFormDisplayElement, AttendancePersonCardElement, AttendanceStructure } from "./attendanceStructure";


export class WholeAttendance implements AttendanceStructure<TEventWholeAttendance> {
    typeName: 'whole' = 'whole'
    name = 'Whole event'
    BookingFormDisplayElement: AttendanceBookingFormDisplayElement<TEventWholeAttendance> = () => null
    getDefaultData = (event: TEvent<any, any, TEventWholeAttendance, any>) => ({})
    PersonFields = (event: TEvent<any, any, TEventWholeAttendance, any>) => []
    PersonCardElement: AttendancePersonCardElement<TEventWholeAttendance> = () => null
}