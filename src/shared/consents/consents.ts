import { EventSchema, TEvent } from "../schemas/event";

export abstract class ConsentStructure {

}

export type ConsentsTypes = TEvent["consents"]["consentsStructure"];

export const ConsentsOptions = EventSchema.shape.consents.options.map((option) => option.shape.consentsStructure.value);