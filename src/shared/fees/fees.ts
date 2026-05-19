
import { FeeStructureValues } from '.'
import { AttendanceStructureValues } from '../attendance/attendance'
import { EventSchema, TEvent } from '../schemas/event'
import { EalingFees } from './ealing'
import { Ealing2026Fees } from './ealing2026'
import { Ealing2026OptionsFees } from './ealing2026options'
import { FeeStructure } from './feeStructure'
import { FreeFees } from './free'
import { VCampFees } from './vcamp'

export const FeeOptions = EventSchema.shape.fee.options.map((option) => option.shape.feeStructure.value)

const feeTypes = [FreeFees, EalingFees, Ealing2026Fees, VCampFees, Ealing2026OptionsFees]

export const getFeeTypesForEvent = (attendanceStructure: AttendanceStructureValues | undefined) => {
  if (!attendanceStructure) return []
  return feeTypes.map((feeType) => new feeType()).filter((fee) => fee.supportedAttendance.includes(attendanceStructure))
}

export const maybeGetFeeType = (feeStructure: FeeStructureValues | undefined): FeeStructure<any> | undefined => {
  if (!feeStructure) return undefined
  const feeType = feeTypes.find((fee) => new fee().typeName === feeStructure)
  if (!feeType) return undefined
  return new feeType()
}

export const getFeeType = (event: TEvent): FeeStructure<any> => {
  const feeStructure = event.fee.feeStructure
  return maybeGetFeeType(feeStructure) || new FreeFees()
}
