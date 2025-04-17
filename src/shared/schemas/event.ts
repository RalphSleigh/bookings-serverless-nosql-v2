import { z } from 'zod';

const basicKP = z.object({ kpStructure: z.literal('basic') });

const kpOptions = z.discriminatedUnion('kpStructure', [basicKP, z.object({ kpStructure: z.literal('large') })]);

export type TBasicKP = z.infer<typeof basicKP>;

const consentsOptions = z.discriminatedUnion('consentsStructure', [z.object({ consentsStructure: z.literal('none') }), z.object({ consentsStructure: z.literal('large') })]);

const attendanceOptions = z.discriminatedUnion('attendanceStructure', [z.object({ attendanceStructure: z.literal('whole') })]);

const ealingFee = z.object({
  feeStructure: z.literal('ealing'),
  ealingData: z.object({
    accompanied: z.number(),
    unaccompanied: z.number(),
    accompaniedDiscount: z.number(),
    unaccompaniedDiscount: z.number(),
    paymentInstructions: z.string(),
  }),
});

const freeFee = z.object({ feeStructure: z.literal('free') })

const feeOptions = z.discriminatedUnion('feeStructure', [freeFee, ealingFee]);

export type TEalingFees = z.infer<typeof ealingFee>;
export type TFreeFees = z.infer<typeof freeFee>;
export type TFees = z.infer<typeof feeOptions>;

const customQuestion = z.object({
  questionType: z.enum(['yesnochoice', 'text', 'longtext']),
  questionLabel: z.string(),
});

export type TCustomQuestion = z.infer<typeof customQuestion>;

export const EventSchema = z.object({
  eventId: z.string(),
  name: z.string().nonempty(),
  description: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  bookingDeadline: z.string(),
  fee: feeOptions,
  kp: kpOptions,
  consents: consentsOptions,
  attendance: attendanceOptions,
  emailSubjectTag: z.string().default(''),
  replyTo: z.string().default(''),
  bigCampMode: z.boolean().default(false),
  applicationsRequired: z.boolean().default(false),
  allParticipantEmails: z.boolean().default(false),
  howDidYouHear: z.boolean().default(false),
  customQuestions: z.array(customQuestion).optional(),
}).strict();

export const EventSchemaWhenCreating = EventSchema.omit({eventId: true}).strict()

export type TEvent = z.infer<typeof EventSchema>;
export type TEventSchemaWhenCreating = z.infer<typeof EventSchemaWhenCreating>;
