import { sendBookingUpdatedEmails } from "../emails/sendBookingUpdatedEmails";
import { getConfig } from "../getConfig";
import { AsyncTask } from "./asyncTaskQueuer";

export const asyncTasksExecutor = async (task: AsyncTask) => {
    const config = await getConfig()
    switch (task.type) {
        case "emailBookingCreated":
            console.log("Handling emailBookingCreated");
            break;
        case "emailBookingUpdated":
            console.log("Handling emailBookingUpdated");
            sendBookingUpdatedEmails(task, config);
            break;
    }
}
