import z from 'zod/v4'

const IndividualApplication = z.object({
  type: z.literal('individual'),
  district: z.string().optional(),
})

const GroupApplication = z.object({
  type: z.literal('group'),
  district: z.string().nonempty('District is required for group applications'),
})

const CommonFields = z.object({
  eventId: z.uuidv7(),
  userId: z.uuidv7(),
  status: z.enum(['pending', 'approved', 'declined']).default('pending'),
  name: z.string().nonempty(),
  email: z.email(),
  minPredicted: z.number().min(1),
  maxPredicted: z.number().min(1),
  createdAt: z.number(),
  updatedAt: z.number(),
})

export const ApplicationSchema = z
  .discriminatedUnion('type', [z.object({ ...CommonFields.shape, ...IndividualApplication.shape }), z.object({ ...CommonFields.shape, ...GroupApplication.shape })])
  .refine((data) => data.minPredicted <= data.maxPredicted, {
    message: 'Maximum must be greater than or equal to Minimum predicted numbers',
    path: ['maxPredicted'], // path of error
  })

export const ApplicationSchemaForForm = z
  .discriminatedUnion('type', [
    z.object({ ...CommonFields.omit({ createdAt: true, updatedAt: true }).shape, ...IndividualApplication.shape }),
    z.object({ ...CommonFields.omit({ createdAt: true, updatedAt: true }).shape, ...GroupApplication.shape }),
  ])
  .refine((data) => data.minPredicted <= data.maxPredicted, {
    message: 'Maximum must be greater than or equal to Minimum predicted numbers',
    path: ['maxPredicted'], // path of error
  })

export type TApplication = z.infer<typeof ApplicationSchema>
export type TApplicationForForm = z.infer<typeof ApplicationSchemaForForm>
