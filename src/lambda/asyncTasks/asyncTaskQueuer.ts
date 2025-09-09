import { am_in_lambda } from "../utils"
import { asyncTasksExecutor } from "./asyncTasksExecutor"

export type EmailBookingCreatedTask = {
    type: "emailBookingCreated"
    data: {
        eventId: string
        userId: string
    }
}

export type EmailBookingUpdatedTask = {
    type: "emailBookingUpdated"
    data: {
        eventId: string
        userId: string
    }
}

export type AsyncTask = EmailBookingCreatedTask | EmailBookingUpdatedTask

export const enqueueAsyncTask = async (task: AsyncTask) => {
    if(am_in_lambda()) {
        // Queue the task in SQS
    } else {
        await asyncTasksExecutor(task)
    }
}
