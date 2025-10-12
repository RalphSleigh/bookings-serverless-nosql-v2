import { keepPreviousData } from '@tanstack/react-query'
import e from 'express'
import { at } from 'lodash'
import { z } from 'zod/v4'

import { KPBasicOptions } from '../kp/kp'
import { TEvent, TEventBasicKP, TEventFreeChoiceAttendance, TEventKPUnion, TEventLargeKP, TEventWholeAttendance } from './event'

const KPBasic = z.object({ diet: z.enum(KPBasicOptions), details: z.string().optional() }).strict()
const KPLarge = z
  .object({
    diet: z.enum(KPBasicOptions),
    details: z.string().optional(),
    preferences: z.string().optional(),
    nut: z.boolean().default(false),
    gluten: z.boolean().default(false),
    soya: z.boolean().default(false),
    dairy: z.boolean().default(false),
    egg: z.boolean().default(false),
    pork: z.boolean().default(false),
    chickpea: z.boolean().default(false),
    diabetic: z.boolean().default(false),
    contactMe: z.boolean().default(false),
  })
  .strict()

export type TPersonBasicKPData = z.infer<typeof KPBasic>
export type TPersonLargeKPData = z.infer<typeof KPLarge>
export type TPersonKPData = TPersonBasicKPData | TPersonLargeKPData

const AttendanceWhole = z.object({}).strict()
const AttendanceFreeChoice = z.object({ bitMask: z.number().min(1, { message: 'Please select at least one night' }) }).strict()

export type TPersonWholeAttendance = z.infer<typeof AttendanceWhole>
export type TPersonFreeChoiceAttendance = z.infer<typeof AttendanceFreeChoice>
export type TPersonAttendance = TPersonWholeAttendance | TPersonFreeChoiceAttendance

export const PersonSchema = (event: TEvent) => {
  const basic = event.allParticipantEmails
    ? z.object({
        name: z.string().nonempty(),
        dob: z.iso.datetime(),
        email: z.email(),
      })
    : z.object({
        name: z.string().nonempty(),
        dob: z.iso.datetime(),
      })
  return z
    .object({
      personId: z.string(),
      userId: z.uuidv7(),
      eventId: z.uuidv7(),
      cancelled: z.boolean().default(false),
      basic: basic.strict(),
      attendance: event.attendance.attendanceStructure === 'whole' ? AttendanceWhole : AttendanceFreeChoice,
      kp: event.kp.kpStructure === 'basic' ? KPBasic : KPLarge,
      health: z
        .object({
          medical: z.string().optional(),
        })
        .strict(),
      createdAt: z.number().optional(),
      updatedAt: z.number().optional(),
    })
    .strict()
}

export const PersonSchemaForType = z
  .object({
    personId: z.string(),
    userId: z.uuidv7(),
    eventId: z.uuidv7(),
    cancelled: z.boolean().default(false),
    basic: z
      .object({
        name: z.string().nonempty(),
        dob: z.iso.datetime(),
        email: z.email().optional(),
      })
      .strict(),
    attendance: AttendanceWhole.or(AttendanceFreeChoice),
    kp: KPBasic.or(KPLarge),
    health: z
      .object({
        medical: z.string().optional(),
      })
      .strict(),
    createdAt: z.number().optional(),
    updatedAt: z.number().optional(),
  })
  .strict()

type MapEventKPToPersonKP<Event extends TEvent> = Event['kp'] extends TEventBasicKP ? TPersonBasicKPData : Event['kp'] extends TEventLargeKP ? TPersonLargeKPData : TPersonKPData

type MapEventAttendanceToPersonAttendance<Event extends TEvent> = Event['attendance'] extends TEventWholeAttendance
  ? TPersonWholeAttendance
  : Event['attendance'] extends TEventFreeChoiceAttendance
    ? TPersonFreeChoiceAttendance
    : TPersonAttendance

export type TPerson<Event extends TEvent = TEvent> = Omit<z.infer<typeof PersonSchemaForType>, 'attendance' | 'kp'> & {
  kp: MapEventKPToPersonKP<Event>
  attendance: MapEventAttendanceToPersonAttendance<Event>
}

