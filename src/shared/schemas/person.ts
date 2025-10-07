import { keepPreviousData } from '@tanstack/react-query'
import { z } from 'zod/v4'

import { KPBasicOptions } from '../kp/kp'
import { TEvent } from './event'

const KPBasic = z.object({ diet: z.enum(KPBasicOptions), details: z.string().optional() }).strict()
const KPLarge = z.object({ diet: z.enum(KPBasicOptions), details: z.string().optional() }).strict()

export type TPersonBasicKPData = z.infer<typeof KPBasic>
export type TPersonLargeKPData = z.infer<typeof KPLarge>
export type TPersonKPData = TPersonBasicKPData | TPersonLargeKPData

export const PersonSchema = (event: TEvent) => {
  const basic = event.allParticipantEmails
    ? z.object({
        name: z.string().nonempty(),
        dob: z.iso.datetime(),
        email: z.email(),
      })
    : z.object({
        name: z.string().nonempty(),
        dob: z.iso.datetime(),
      })
  return z
    .object({
      personId: z.string(),
      userId: z.uuidv7(),
      eventId: z.uuidv7(),
      cancelled: z.boolean().default(false),
      basic: basic.strict(),
      kp: event.kp.kpStructure === 'basic' ? KPBasic : KPLarge,
      health: z
        .object({
          medical: z.string().optional(),
        })
        .strict(),
      createdAt: z.number().optional(),
      updatedAt: z.number().optional(),
    })
    .strict()
}

export const PersonSchemaForType = z
  .object({
    personId: z.string(),
    userId: z.uuidv7(),
    eventId: z.uuidv7(),
    cancelled: z.boolean().default(false),
    basic: z
      .object({
        name: z.string().nonempty(),
        dob: z.iso.datetime(),
        email: z.email().optional(),
      })
      .strict(),
    kp: KPBasic.or(KPLarge),
    health: z
      .object({
        medical: z.string().optional(),
      })
      .strict(),
    createdAt: z.number().optional(),
    updatedAt: z.number().optional(),
  })
  .strict()

type MapEventKPToPersonKP<Event extends TEvent> = Event['kp'] extends { kpStructure: 'basic' }
  ? TPersonBasicKPData
  : Event['kp'] extends { kpStructure: 'large' }
    ? TPersonLargeKPData
    : TPersonKPData

export type TPerson<Event extends TEvent = TEvent> = z.infer<typeof PersonSchemaForType> & { kp: MapEventKPToPersonKP<Event> }
/* export type TPersonWithBasicKP = TPerson & { kp: z.infer<typeof KPBasic> }
export type TPersonWithOptions<KP extends TPersonBasicKPData | TPersonLargeKPData> = TPerson & { kp: KP }
 */