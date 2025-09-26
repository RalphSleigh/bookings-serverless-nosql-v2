import { v7 as uuidv7 } from 'uuid'
import { z } from 'zod/v4'

const payment = z.object({
  feeId: z.uuidv7(),
  eventId: z.uuidv7(),
  userId: z.uuidv7(),
  type: z.literal('payment'),
  amount: z.number(),
  note: z.string().optional(),
  createdAt: z.number().optional(),
})

const adjustment = z.object({
  feeId: z.uuidv7(),
  eventId: z.uuidv7(),
  userId: z.uuidv7(),
  type: z.literal('adjustment'),
  amount: z.number(),
  note: z.string().optional(),
  createdAt: z.number().optional(),
})

export const FeeSchema = z.discriminatedUnion('type', [payment, adjustment])
export const FeeSchemaForForm = z.union([payment.omit({ feeId: true, createdAt: true }).partial({type:true}), adjustment.omit({ feeId: true, createdAt: true }).partial({type:true})])

export type TFee = z.infer<typeof FeeSchema>
export type TFeeForForm = z.infer<typeof FeeSchemaForForm>
