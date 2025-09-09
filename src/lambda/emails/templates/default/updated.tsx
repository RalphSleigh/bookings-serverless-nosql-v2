import { Html, Link, Text } from '@react-email/components'

import { getFeeType } from '../../../../shared/fees/fees'
import { ConfigType } from '../../../getConfig'
import { BookingEmailData } from '../../sendEmail'
import { EmailTemplate } from '../template'

export class BookingUpdatedEmail extends EmailTemplate {
  subject(data: BookingEmailData) {
    return `Booking updated for ${data.event.name}`
  }

  HTMLBody(data: BookingEmailData, config: ConfigType) {
    const editLink = `${config.BASE_URL}event/${data.event.eventId}/own/update`

    const participantsList = data.booking.people.map((p, i) => (
      <li key={i} style={{ fontSize: '14px' }}>
        {p.basic.name}
      </li>
    ))

    const fees = getFeeType(data.event)

    return (
      <Html lang="en">
        <Text>Hi {data.recipient.name}</Text>
        <Text>
          You have updated your booking for {data.event.name}, You have booked {data.booking.people.length} {data.booking.people.length === 1 ? 'person' : 'people'}:
        </Text>
        <ul>{participantsList}</ul>
        <Text>
          You can come back and edit your booking <Link href={editLink}>here</Link>.
        </Text>
        <Text>
          <p>Blue Skies and Friendship,</p>
          <p>Woodcraft Folk</p>
        </Text>
      </Html>
    )
  }
}
