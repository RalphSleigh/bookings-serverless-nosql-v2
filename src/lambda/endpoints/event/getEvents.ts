import { EventSchema, TEvent } from "../../../shared/schemas/event"
import { DBEvent } from "../../dynamo"
import { HandlerWrapper } from "../../utils"


export type getEventsResponseType = {events: TEvent[]}
export const getEvents = HandlerWrapper<any, getEventsResponseType>(async (event, context) => {
    const events = await DBEvent.query.natural({}).go()
    if(events.data) return {events: events.data.map(event => EventSchema.parse(event))}
    throw new Error("Events query failed")
})