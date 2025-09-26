import { keepPreviousData } from '@tanstack/react-query'
import { z } from 'zod/v4'

import { KPBasicOptions } from '../kp/kp'
import { TEvent } from './event'

const KPBasic = z.object({ diet: z.enum(KPBasicOptions), details: z.string().optional() }).strict()
const KPLarge = z.object({ diet: z.enum(KPBasicOptions), details: z.string().optional() }).strict()

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
      personId: z.uuidv7(),
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
    personId: z.uuidv7().optional(),
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

export type TPerson = z.infer<typeof PersonSchemaForType>
