import { EventSchema, TEvent } from '../schemas/event'
import { WholeAttendance } from './whole'
import { FreeChoiceAttendance } from './freechoice'
import { AttendanceStructure } from './attendanceStructure'


export const AttendanceOptions = EventSchema.shape.attendance.options.map((option) => option.shape.attendanceStructure.value)

const attendanceTypes = [WholeAttendance, FreeChoiceAttendance]

export type AttendanceTypes = InstanceType<(typeof attendanceTypes)[number]>
export type AttendanceStructureValues = TEvent["attendance"]["attendanceStructure"];

export const maybeGetAttendanceType = (attendanceStructure: AttendanceStructureValues | undefined): AttendanceStructure<any> | undefined => {
  if (!attendanceStructure) return undefined
  const attendanceType = attendanceTypes.find((attendance) => new attendance().typeName === attendanceStructure)
  if (!attendanceType) return undefined
  return new attendanceType()
}

export const getAttendanceType = (event: TEvent): AttendanceStructure<any> => {
  const attendanceStructure = event.attendance.attendanceStructure
  return maybeGetAttendanceType(attendanceStructure) || new WholeAttendance()
}
