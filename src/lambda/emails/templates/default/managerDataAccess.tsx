import { Html, Link, Text } from '@react-email/components'
import * as React from 'react'

import { ConfigType } from '../../../getConfig'
import { BasicEmailData } from '../../sendEmail'
import { EmailTemplate } from '../template'

export class ManagerDataAccessEmail extends EmailTemplate {
  subject(data: BasicEmailData) {
    return `[${data.event.emailSubjectTag}] You have been granted access to data for ${data.event.name}`
  }

  HTMLBody(data: BasicEmailData, config: ConfigType) {
    return (
      <Html lang="en">
        <Text>Hi {data.recipient.name}</Text>
        <Text>You have been granted access to bookings data for {data.event.name}, to view it please log in and choose the "manage" link in bottom corner of the event card.</Text>
        <Text>
          <p>Blue Skies and Friendship,</p>
          <p>Woodcraft Folk</p>
        </Text>
      </Html>
    )
  }
}
