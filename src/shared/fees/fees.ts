import { PartialDeep } from "type-fest";
import { AttendanceTypes } from "../attendance/attendance";
import { EventSchema, TEvent, TFees } from "../schemas/event";
import { EalingFees } from "./ealing";
import { FreeFees } from "./free";
import { FeeStructure } from "./feeStructure";

export const FeeOptions = EventSchema.shape.fee.options.map((option) => option.shape.feeStructure.value);

const feeTypes = [FreeFees, EalingFees]

type FeeTypes = InstanceType<typeof feeTypes[number]>

export const getFeeTypesForEvent = (event: PartialDeep<TEvent>) => {
    const attendanceStrucure = event.attendance?.attendanceStructure
    if(!attendanceStrucure) return []
    return feeTypes.map((feeType) => new feeType()).filter((fee) => fee.supportedAttendance.includes(attendanceStrucure))
}

export const maybeGetFeeType = (event: PartialDeep<TEvent>): FeeTypes | undefined => {
    const feeStructure = event.fee?.feeStructure
    if (!feeStructure) return undefined
    const feeType = feeTypes.find((fee) => new fee().typeName === feeStructure)
    if (!feeType) return undefined
    return new feeType()
}