import dayjs from 'dayjs'
import { z } from 'zod/v4'

import { KPBasicOptions } from '../kp/kp'
import { TEvent, TEventBasicKP, TEventFreeChoiceAttendance, TEventKPUnion, TEventLargeKP, TEventWholeAttendance } from './event'

const KPBasic = z.object({ diet: z.enum(KPBasicOptions), details: z.string().optional() })
const KPLarge = z.object({
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

export type TPersonBasicKPData = z.infer<typeof KPBasic>
export type TPersonLargeKPData = z.infer<typeof KPLarge>
export type TPersonKPData = TPersonBasicKPData | TPersonLargeKPData

const AttendanceWhole = z.undefined()
const AttendanceFreeChoice = z.object({ bitMask: z.number().min(1, { message: 'Please select at least one night' }) })

export type TPersonWholeAttendance = z.infer<typeof AttendanceWhole>
export type TPersonFreeChoiceAttendance = z.infer<typeof AttendanceFreeChoice>
export type TPersonAttendance = TPersonWholeAttendance | TPersonFreeChoiceAttendance

const HealthSmall = z.object({ medical: z.string().optional() })
const HealthLarge = z.object({ medical: z.string().optional(), accessibility: z.string().optional(), contactMe: z.boolean().default(false) })

const ConsentNone = z.undefined()
const ConsentVCamp = z.object({ photo: z.enum(['Yes', 'No']), rse: z.enum(['Yes', 'No']).optional(), activities: z.enum(['Yes', 'No']) })

export const PersonSchema = (event: TEvent) => {
  const startDate = dayjs(event.startDate)
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
      basic: basic,
      attendance: event.attendance.attendanceStructure === 'whole' ? AttendanceWhole : AttendanceFreeChoice,
      kp: event.kp.kpStructure === 'basic' ? KPBasic : KPLarge,
      health: event.bigCampMode ? HealthLarge : HealthSmall,
      consents: event.consents.consentsStructure === 'none' ? ConsentNone : ConsentVCamp,
      firstAid: z.boolean().optional(),
      createdAt: z.number().optional(),
      updatedAt: z.number().optional(),
    })
    .refine(
      (data) => {
        const dob = dayjs(data.basic.dob)
        return !(event.consents.consentsStructure === 'vcamp' && dob.add(12, 'years').isBefore(startDate) && dob.add(18, 'years').isAfter(startDate) && !data.consents.rse)
      },
      {
        path: ['consents', 'rse'],
        error: `RSE Consent is required for those aged 12 - 17`,
      },
    )
}

export const PersonSchemaForType = z.object({
  personId: z.string(),
  userId: z.uuidv7(),
  eventId: z.uuidv7(),
  cancelled: z.boolean().default(false),
  basic: z.object({
    name: z.string().nonempty(),
    dob: z.iso.datetime(),
    email: z.email().optional(),
  }),
  attendance: AttendanceWhole.or(AttendanceFreeChoice),
  kp: KPBasic.or(KPLarge),
  health: HealthSmall.or(HealthLarge),
  consents: ConsentNone.or(ConsentVCamp),
  firstAid: z.boolean().optional(),
  createdAt: z.number().optional(),
  updatedAt: z.number().optional(),
})

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
