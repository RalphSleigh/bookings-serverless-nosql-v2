import { EventSchema, TEvent } from '../schemas/event'
import { AttendanceStructure } from './attendanceStructure'
import { FreeChoiceAttendance } from './freechoice'
import { OptionsAttendance } from './options'
import { WholeAttendance } from './whole'

export const AttendanceOptions = EventSchema.shape.attendance.options.map((option) => option.shape.attendanceStructure.value)

const attendanceTypes: AttendanceStructure[] = [new WholeAttendance() as AttendanceStructure, new FreeChoiceAttendance() as AttendanceStructure, new OptionsAttendance() as AttendanceStructure]

export type AttendanceStructureValues = TEvent['attendance']['attendanceStructure']

export const maybeGetAttendanceType = (attendanceStructure: AttendanceStructureValues | undefined): AttendanceStructure<any> | undefined => {
  if (!attendanceStructure) return undefined
  const attendanceType = attendanceTypes.find((attendance) => attendance.typeName === attendanceStructure)
  if (!attendanceType) return undefined
  return attendanceType
}

export const getAttendanceType = (event: TEvent): AttendanceStructure<any> => {
  const attendanceStructure = event.attendance.attendanceStructure
  return maybeGetAttendanceType(attendanceStructure) || (new WholeAttendance() as AttendanceStructure)
}
