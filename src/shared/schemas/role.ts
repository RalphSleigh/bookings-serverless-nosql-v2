import { use } from 'react';
import { z } from 'zod';

export const RoleSchema = z.object({
    userId: z.string(),
    role: z.enum(['admin']),
    eventId: z.string().optional(),
})

export type TRole = z.infer<typeof RoleSchema>
