import { z } from "zod/v4";
import { TRole } from './role';
import { id } from "zod/v4/locales";

export const VillagesSchema = z.object({
    eventId: z.uuidv7(),
    villages: z.array(z.object({
        id: z.string(),
        name: z.string(),
        bookings: z.array(z.uuidv7()),
    }))
})

export type TVillages = z.infer<typeof VillagesSchema>;
