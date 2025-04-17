import { EventSchema, TEvent } from "../schemas/event";

export abstract class AttendanceStructure {

}

export type AttendanceTypes = TEvent["attendance"]["attendanceStructure"];

export const AttendanceOptions = EventSchema.shape.attendance.options.map((option) => option.shape.attendanceStructure.value);