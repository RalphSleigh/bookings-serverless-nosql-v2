import { z } from 'zod/v4'

export const EventRoleSchema = z
  .object({
    roleId: z.uuidv7(),
    userId: z.uuidv7(),
    role: z.enum(['owner','manager','viewer']),
    eventId: z.uuidv7(),
  })
  .strict()

const globalRole = z
  .object({
    roleId: z.uuidv7(),
    userId: z.uuidv7(),
    role: z.enum(['admin']),
    eventId: z.literal('global'),
  })
  .strict()

export const RoleSchema = z.union([EventRoleSchema, globalRole])

export const RoleForFormSchema = EventRoleSchema.omit({ roleId: true })

export type TRole = z.infer<typeof RoleSchema>
export type TRoleForForm = z.infer<typeof RoleForFormSchema>