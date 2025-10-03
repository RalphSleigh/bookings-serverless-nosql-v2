import { PartialDeep } from 'type-fest'
import { z, ZodType } from 'zod/v4'

import { TEvent } from './event'
import { PersonSchema, PersonSchemaForType } from './person'

//Basic Information/Contact Details

const basicSmall = z
  .object({
    name: z.string().nonempty(),
    email: z.string().email(),
    telephone: z.string().nonempty(),
  })
  .strict()

const basicBigIndividual = basicSmall
  .extend({
    district: z.string().optional(),
  })
  .strict()

const basicBigIndividualWithOrg = basicBigIndividual
  .extend({
    organisation: z.string().nonempty(),
  })
  .strict()

const basicBigGroup = basicSmall
  .extend({
    district: z.string().nonempty(),
  })
  .strict()

const basicBigGroupWithOrg = basicBigGroup
  .extend({
    organisation: z.string().nonempty(),
  })
  .strict()

const basicBigNoOrg = z.discriminatedUnion('type', [basicBigIndividual.extend({ type: z.literal('individual') }).strict(), basicBigGroup.extend({ type: z.literal('group') }).strict()])
const basicBigWithOrg = z.discriminatedUnion('type', [basicBigIndividualWithOrg.extend({ type: z.literal('individual') }).strict(), basicBigGroupWithOrg.extend({ type: z.literal('group') }).strict()])

const basicBigForType = basicBigWithOrg.or(basicBigNoOrg)

// Extra Contacts

const extraContact = z.object({
  name: z.string().nonempty(),
  email: z.string().email(),
})

// Other Stuff

const otherBig = z.object({
  anythingElse: z.string().optional(),
})

const otherSmall = z.object({
  anythingElse: z.string().optional(),
  whatsApp: z.enum(['yes', 'no']),
})

// Main Booking Schema, which is used for validation, depends on the event

export const BookingSchema = (event: TEvent) =>
  z
    .object({
      userId: z.uuidv7(),
      eventId: z.uuidv7(),
      cancelled: z.boolean().default(false),
      basic: event.bigCampMode ? (event.organisations ? basicBigWithOrg : basicBigNoOrg) : basicSmall,
      extraContacts: z.array(extraContact).optional(),
      people: z.array(PersonSchema(event)).min(1),
      other: event.bigCampMode ? otherBig : otherSmall,
      createdAt: z.number().optional(),
      updatedAt: z.number().optional(),
    })
    .strict()

//Schemas used for types, these don't depend on the event, but are used for type checking:

export const BookingSchemaForType = z
  .object({
    userId: z.uuidv7(),
    eventId: z.uuidv7(),
    cancelled: z.boolean().default(false),
    basic: basicSmall.or(basicBigForType),
    extraContacts: z.array(extraContact).optional(),
    people: z.array(PersonSchemaForType).min(1),
    other: otherBig.or(otherSmall),
    createdAt: z.number().optional(),
    updatedAt: z.number().optional(),
  })
  .strict()

export type TBookingForType = z.infer<typeof BookingSchemaForType>

export const BookingSchemaForTypeBasicSmall = BookingSchemaForType.extend({
  basic: basicSmall,
})

export const BookingSchemaForTypeBasicBig = basicBigForType

export const BookingSchemaForTypeBasicBigGroup = BookingSchemaForType.extend({
  basic: basicBigGroup.and(z.object({ organisation: z.string().optional() })),
})

export type TBookingSchemaForTypeBasicSmall = z.infer<typeof BookingSchemaForTypeBasicSmall>
export type TBookingSchemaForTypeBasicBig = z.infer<typeof BookingSchemaForTypeBasicBig>
export type TBookingSchemaForTypeBasicBigGroup = z.infer<typeof BookingSchemaForTypeBasicBigGroup>

export type TBooking = z.infer<typeof BookingSchemaForType>

export type PartialBookingType = PartialDeep<TBookingForType, { recurseIntoArrays: true }>