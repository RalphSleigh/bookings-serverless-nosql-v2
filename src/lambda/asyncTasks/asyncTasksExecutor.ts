import { postDiscordMessage } from "../discord/discordMessagePoster";
import { syncDriveForEvent } from "../driveSync/driveSyncer";
import { sendBookingCreatedEmails } from "../emails/sendBookingCreatedEmails";
import { sendBookingUpdatedEmails } from "../emails/sendBookingUpdatedEmails";
import { sendManagerDataAccessEmail } from "../emails/sendManagerDataAccessEmail";
import { getConfig } from "../getConfig";
import { AsyncTask } from "./asyncTaskQueuer";

export const asyncTasksExecutor = async (task: AsyncTask) => {
    const config = await getConfig()
    switch (task.type) {
        case "emailBookingCreated":
            console.log("Handling emailBookingCreated");
            await sendBookingCreatedEmails(task, config);
            break;
        case "emailBookingUpdated":
            console.log("Handling emailBookingUpdated");
            await sendBookingUpdatedEmails(task, config);
            break;
        case "emailManagerDataAccess":
            console.log("Handling emailManagerDataAccess");
            await sendManagerDataAccessEmail(task, config);
            break;
        case "driveSync":
            console.log("Handling driveSync");
            await syncDriveForEvent(task.data.eventId, config);
            break;
        case "discordMessage":
            console.log("Handling discordMessage");
            await postDiscordMessage(task, config);
            break;
    }
}
