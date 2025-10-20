import { z } from 'zod/v4'

const basicKP = z.object({ kpStructure: z.literal('basic') })
const largeKP = z.object({ kpStructure: z.literal('large') })
const kpOptions = z.discriminatedUnion('kpStructure', [basicKP, largeKP])

export type TEventKPUnion = z.infer<typeof kpOptions>
export type TEventBasicKP = z.infer<typeof basicKP>
export type TEventLargeKP = z.infer<typeof largeKP>

const noneConsents = z.object({ consentsStructure: z.literal('none') })
const vcampConsents = z.object({ consentsStructure: z.literal('vcamp') })
const consentsOptions = z.discriminatedUnion('consentsStructure', [noneConsents, vcampConsents])

export type TEventConsentsUnion = z.infer<typeof consentsOptions>
export type TEventNoneConsents = z.infer<typeof noneConsents>
export type TEventVCampConsents = z.infer<typeof vcampConsents>

const wholeAttendance = z.object({ attendanceStructure: z.literal('whole') })
const freeChoiceAttendance = z.object({ attendanceStructure: z.literal('freechoice') })
const attendanceOptions = z.discriminatedUnion('attendanceStructure', [wholeAttendance, freeChoiceAttendance])

export type TEventAttendanceUnion = z.infer<typeof attendanceOptions>
export type TEventWholeAttendance = z.infer<typeof wholeAttendance>
export type TEventFreeChoiceAttendance = z.infer<typeof freeChoiceAttendance>

const ealingFee = z.object({
  feeStructure: z.literal('ealing'),
  ealingData: z.object({
    accompanied: z.number(),
    unaccompanied: z.number(),
    accompaniedDiscount: z.number(),
    unaccompaniedDiscount: z.number(),
    paymentInstructions: z.string().nonempty(),
  }),
})

const freeFee = z.object({ feeStructure: z.literal('free') })
const vcampFee = z.object({ feeStructure: z.literal('vcamp') })
const feeOptions = z.discriminatedUnion('feeStructure', [freeFee, ealingFee, vcampFee])

export type TEventFeesUnion = z.infer<typeof feeOptions>
export type TEventEalingFees = z.infer<typeof ealingFee>
export type TEventFreeFees = z.infer<typeof freeFee>
export type TEventVCampFees = z.infer<typeof vcampFee>

const customQuestion = z.object({
  questionType: z.enum(['yesnochoice', 'text', 'longtext']),
  questionLabel: z.string().nonempty(),
})

export type TCustomQuestion = z.infer<typeof customQuestion>

export const EventSchema = z.object({
  eventId: z.uuidv7(),
  deleted: z.boolean().default(false),
  name: z.string().nonempty(),
  description: z.string().optional(),
  startDate: z.iso.datetime(),
  endDate: z.iso.datetime(),
  bookingDeadline: z.iso.datetime(),
  fee: feeOptions,
  kp: kpOptions,
  consents: consentsOptions,
  attendance: attendanceOptions,
  emailSubjectTag: z.string().nonempty(),
  replyTo: z.string().nonempty(),
  bigCampMode: z.boolean().default(false),
  organisations: z.boolean().default(false),
  applicationsRequired: z.boolean().default(false),
  allParticipantEmails: z.boolean().default(false),
  howDidYouHear: z.boolean().default(false),
  customQuestions: z.array(customQuestion),
})

export const EventSchemaWhenCreating = EventSchema.partial({ eventId: true })

export type TEvent<
  KP extends TEventKPUnion = TEventKPUnion,
  C extends TEventConsentsUnion = TEventConsentsUnion,
  A extends TEventAttendanceUnion = TEventAttendanceUnion,
  F extends TEventFeesUnion = TEventFeesUnion,
> = Omit<z.infer<typeof EventSchema>, 'kp' | 'consents' | 'attendance' | 'fee'> & { kp: KP; consents: C; attendance: A; fee: F }

export type TEventWhenCreating = z.infer<typeof EventSchemaWhenCreating>
