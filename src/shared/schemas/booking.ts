import { z, ZodType } from "zod/v4";

import { TEvent } from './event'
import { PersonSchema, PersonSchemaForType } from './person'
import { PartialDeep } from "type-fest";

//Basic Information/Contact Details

const basicSmall = z
  .object({
    name: z.string().nonempty(),
    email: z.string().email(),
    telephone: z.string().nonempty(),
  })
  .strict()

const basicBigIndividual = basicSmall.extend({
    organisation: z.string().nonempty(),
    district: z.string().optional(),
  })

const basicBigGroup = basicSmall
  .extend({
    organisation: z.string().nonempty(),
    district: z.string().nonempty(),
  })
  .strict()

const basicBig = z.discriminatedUnion('type', [
  basicBigIndividual.extend({ type: z.literal('individual')}),
  basicBigGroup.extend({ type: z.literal('group') })])

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
        basic: event.bigCampMode ? basicBig : basicSmall,
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
    basic: basicSmall.or(basicBig),
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

export const BookingSchemaForTypeBasicBig = BookingSchemaForType.extend({
  basic: basicBig,
})

export const BookingSchemaForTypeBasicBigGroup = BookingSchemaForType.extend({
  basic: basicBigGroup,
})

export type TBookingSchemaForTypeBasicSmall = z.infer<typeof BookingSchemaForTypeBasicSmall>
export type TBookingSchemaForTypeBasicBig = z.infer<typeof BookingSchemaForTypeBasicBig>
export type TBookingSchemaForTypeBasicBigGroup = z.infer<typeof BookingSchemaForTypeBasicBigGroup>

export type TBooking = z.infer<typeof BookingSchemaForType>

export type PartialBookingType = PartialDeep<TBookingForType, { recurseIntoArrays: true }>

export type TBasicBig = z.infer<typeof basicBig>
