import { Html, Text } from "@react-email/components"
import { ConfigType } from "../../../getConfig"
import { BookingEmailData } from "../../sendEmail"
import { EmailTemplate } from "../template"

export class ManagerApplicationReceivedEmail extends EmailTemplate {
    subject(data: BookingEmailData) {
        return `[${data.event.emailSubjectTag}] Application Added`
    }

    HTMLBody(data: BookingEmailData, config: ConfigType) {
        return (<Html lang="en">
            <Text>Hi {data.recipient.name}</Text>
            <Text>{data.bookingOwner.name} has applied to book for {data.event.name}.
                You should log on to to check their application, and badger Ralph to make this e-mail more useful
                with info and links you can just click to approve.</Text>
            <Text>
                <p>Blue Skies and Friendship,</p>
                <p>Woodcraft Folk</p>
            </Text>
        </Html>)
    }
}