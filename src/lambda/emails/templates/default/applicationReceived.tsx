import { Html, Text } from "@react-email/components"
import { ApplicationEmailData, BasicEmailData, BookingEmailData } from "../../sendEmail"
import { EmailTemplate } from "../template"
import { ConfigType } from "../../../getConfig"

export class ApplicationReceivedEmail extends EmailTemplate {
    subject(data: BasicEmailData) {
        return `Application received for ${data.event.name}`
    }

    HTMLBody(data: BasicEmailData, config: ConfigType) {

        return (<Html lang="en">
            <Text>Hi {data.recipient.name}</Text>
            <Text>Thanks for applying to book for {data.event.name}. One of our team will check your application as soon as
                    possible and you will receive another e-mail as soon as you are approved to book in.
            </Text>
            <Text>
                <p>Blue Skies and Friendship,</p>
                <p>Woodcraft Folk</p>
            </Text>
        </Html>)
    }
}