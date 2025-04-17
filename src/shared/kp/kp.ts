import { EventSchema, TEvent } from "../schemas/event";

export abstract class KPStructure {

}

export type KPTypes = TEvent["kp"]["kpStructure"];

export const KPOptions = EventSchema.shape.kp.options.map((option) => option.shape.kpStructure.value);