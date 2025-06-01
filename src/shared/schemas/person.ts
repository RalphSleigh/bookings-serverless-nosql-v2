import { z } from "zod/v4";
import { KPBasicOptions } from "../kp/kp";
import { keepPreviousData } from "@tanstack/react-query";
import { TEvent } from "./event";


const KPBasic = z.object({ diet: z.enum(KPBasicOptions)}).strict(); 
const KPLarge = z.object({ diet: z.enum(KPBasicOptions), allergies: z.string().optional() }).strict();

export const PersonSchema = (event: TEvent) => z.object({
    personId: z.string().nonempty(),
    userId: z.string().nonempty(),
    eventId: z.string().nonempty(),
    cancelled: z.boolean().default(false),
    basic: z.object({
        name: z.string().nonempty(),
        dob: z.iso.datetime(),
        email: event.allParticipantEmails ? z.email() : z.undefined(),
    }).strict(),
    kp: event.kp.kpStructure === 'basic' ? KPBasic : KPLarge,
    createdAt: z.number().optional(),
    updatedAt: z.number().optional(),
}).strict()


export const PersonSchemaForType = z.object({
    personId: z.string().nonempty(),
    userId: z.string().nonempty(),
    eventId: z.string().nonempty(),
    cancelled: z.boolean().default(false),
    basic: z.object({
        name: z.string().nonempty(),
        dob: z.iso.datetime(),
        email: z.email().optional(),
    }).strict(),
    kp: KPBasic.or(KPLarge),
    createdAt: z.number().optional(),
    updatedAt: z.number().optional(),
}).strict()

export type TPerson = z.infer<typeof PersonSchemaForType>
