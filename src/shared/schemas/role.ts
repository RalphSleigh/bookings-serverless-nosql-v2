import { z } from 'zod/v4'

export const RoleSchema = z.object({
  userId: z.string(),
  role: z.enum(['admin']),
  eventId: z.string().optional(),
})

export type TRole = z.infer<typeof RoleSchema>
