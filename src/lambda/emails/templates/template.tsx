import { ConfigType } from "../../getConfig";
import { EmailData } from "../sendEmail";



export abstract class EmailTemplate {
    abstract subject(data: EmailData): string
    abstract HTMLBody(data: EmailData, config: ConfigType): React.ReactElement
}