import { PartialDeep } from "type-fest";
import { AttendanceStructureValues, AttendanceTypes } from "../attendance/attendance";
import { EventSchema, TEvent } from "../schemas/event";
import { EalingFees } from "./ealing";
import { FreeFees } from "./free";
import { FeeStructure } from "./feeStructure";
import { FeeStructureValues } from ".";

export const FeeOptions = EventSchema.shape.fee.options.map((option) => option.shape.feeStructure.value);

const feeTypes = [FreeFees, EalingFees]


type FeeTypes = InstanceType<typeof feeTypes[number]>

export const getFeeTypesForEvent = (attendanceStructure: AttendanceStructureValues | undefined) => {
    if(!attendanceStructure) return []
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