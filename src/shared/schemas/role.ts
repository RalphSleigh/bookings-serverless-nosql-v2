import { z } from 'zod/v4'

export const EventRoleSchema = z
  .object({
    roleId: z.uuidv4(),
    userId: z.uuidv4(),
    role: z.enum(['owner']),
    eventId: z.uuidv4(),
  })
  .strict()

const globalRole = z
  .object({
    roleId: z.uuidv4(),
    userId: z.uuidv4(),
    role: z.enum(['admin']),
  })
  .strict()

export const RoleSchema = z.union([EventRoleSchema, globalRole])

export const RoleForFormSchema = z.union([EventRoleSchema.omit({ roleId: true }), globalRole.omit({ roleId: true })])

export type TRole = z.infer<typeof RoleSchema>
export type TRoleForForm = z.infer<typeof RoleForFormSchema>