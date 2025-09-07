import { z } from "zod/v4";

const basicKP = z.object({ kpStructure: z.literal('basic') })

const kpOptions = z.discriminatedUnion('kpStructure', [basicKP, z.object({ kpStructure: z.literal('large') })])

export type TBasicKP = z.infer<typeof basicKP>

const consentsOptions = z.discriminatedUnion('consentsStructure', [z.object({ consentsStructure: z.literal('none') }), z.object({ consentsStructure: z.literal('large') })])

const attendanceOptions = z.discriminatedUnion('attendanceStructure', [z.object({ attendanceStructure: z.literal('whole') })])

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

const feeOptions = z.discriminatedUnion('feeStructure', [freeFee, ealingFee])

export type TEalingFees = z.infer<typeof ealingFee>
export type TFreeFees = z.infer<typeof freeFee>
export type TFees = z.infer<typeof feeOptions>

const customQuestion = z.object({
  questionType: z.enum(['yesnochoice', 'text', 'longtext']),
  questionLabel: z.string().nonempty()
})

export type TCustomQuestion = z.infer<typeof customQuestion>


export const EventSchema = z
  .object(
    {
      eventId: z.string().nonempty(),
      name: z.string().nonempty(),
      description: z.string().nonempty(),
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
      applicationsRequired: z.boolean().default(false),
      allParticipantEmails: z.boolean().default(false),
      howDidYouHear: z.boolean().default(false),
      customQuestions: z.array(customQuestion),
    }
  )
  .strict()

export const EventSchemaWhenCreating = EventSchema.partial({ eventId: true }).strict()

export type TEvent = z.infer<typeof EventSchema>
export type TEventWithFees<F> = TEvent & { fee: F }
export type TEventWhenCreating = z.infer<typeof EventSchemaWhenCreating>
