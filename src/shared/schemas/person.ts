import { z } from "zod";
import { KPBasicOptions } from "../kp/kp";
import { keepPreviousData } from "@tanstack/react-query";
import { TEvent } from "./event";


const KPBasic = z.object({ diet: z.enum(KPBasicOptions)}).strict(); 
const KPLarge = z.object({ diet: z.enum(KPBasicOptions), allergies: z.string().optional() }).strict();

export const PersonSchema = (event: TEvent) => z.object({
    basic: z.object({
        name: z.string().nonempty(),
        dob: z.string().datetime(),
        email: event.allParticipantEmails ? z.string().email() : z.void(),
    }).strict(),
    kp: event.kp.kpStructure === 'basic' ? KPBasic : KPLarge
}).strict()


export const PersonSchemaForType = z.object({
    basic: z.object({
        name: z.string().nonempty(),
        dob: z.string().datetime(),
        email: z.string().email().optional(),
    }).strict(),
    kp: KPBasic.or(KPLarge)
}).strict()

