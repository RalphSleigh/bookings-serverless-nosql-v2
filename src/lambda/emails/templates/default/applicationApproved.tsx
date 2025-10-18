import { Html, Link, Text } from '@react-email/components'

import { ConfigType } from '../../../getConfig.js'
import { ApplicationEmailData } from '../../sendEmail.js'
import { EmailTemplate } from '../template.js'

export class ApplicationApprovedEmail extends EmailTemplate {
  subject(data: ApplicationEmailData) {
    return `Application approved for ${data.event.name}`
  }

  HTMLBody(data: ApplicationEmailData, config: ConfigType) {
    return (
      <Html lang="en">
        <Text>Hi {data.recipient.name}</Text>
        <Text>You have been approved to book into {data.event.name} and can do so at any time here:</Text>
        <Text>
          <Link href={config.BASE_URL}>{config.BASE_URL}</Link>
        </Text>
        <Text>
          <p>Blue Skies and Friendship,</p>
          <p>Woodcraft Folk</p>
        </Text>
      </Html>
    )
  }
}
