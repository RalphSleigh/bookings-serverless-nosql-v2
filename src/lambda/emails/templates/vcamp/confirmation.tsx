import { Html, Link, Text } from '@react-email/components'

import { getFeeType } from '../../../../shared/fees/fees.js'
import { ConfigType } from '../../../getConfig.js'
import { BookingEmailData } from '../../sendEmail.js'
import { EmailTemplate } from '../template.js'

export class VCampBookingConfirmationEmail extends EmailTemplate {
  subject(data: BookingEmailData) {
    return `Booking confirmation for ${data.event.name}`
  }

  HTMLBody(data: BookingEmailData, config: ConfigType) {
    const editLink = `${config.BASE_URL}/event/${data.event.eventId}/own/update`

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
          Thanks for booking for {data.event.name}. You have booked {data.booking.people.length} {data.booking.people.length === 1 ? 'person' : 'people'}:
        </Text>
        <ul>{participantsList}</ul>
        <Text>
          You can come back and edit your booking <Link href={editLink}>here</Link>.
        </Text>
        <Text>
          <fees.EmailElement event={data.event} booking={data.booking} />
        </Text>
        <Text>
          <p>Blue Skies and Friendship,</p>
          <p>Woodcraft Folk</p>
        </Text>
        <Text>
          <b>THIS IS YOUR INVOICE</b>
        </Text>
        <Text>
          <b>DATE OF ISSUE: {new Date().toLocaleDateString()}</b>
        </Text>
        <Text>
          <b>Please pay by bank transfer where possible </b>
        </Text>
        <Text>
          <b>
            Your payment reference is {fees.getPaymentReference(data.booking)}. You must use this reference with all payments. That is how we are able to identify your booking and reduce your
            outstanding balance.
          </b>
        </Text>
        <Text>
          <b>We strongly encourage that groups pay camp fees by bank transfer where possible.</b>
          Please transfer all payments into the following account <br />
          Account name: Woodcraft Folk <br />
          Account number: 2039 2756
          <br />
          Sort code: 60 83 01
        </Text>
        <Text>
          If for any reason you cannot add a reference, please send an email to <Link href={'mailto:info@venturercamp.org.uk'}>info@venturercamp.org.uk</Link> and let us know how much you paid, when
          you paid it and who it was for so we can match up payments.
        </Text>
        <Text>
          <b>
            International bank transfer: <br />
            IBAN Number: GB93NWBK60023571418024 <br />
            Swift Code (BIC): NWBKGB2L
          </b>
        </Text>
        <Text>
          <b>Cheques</b>
          <br />
          If you cannot complete the payment via BACS you can send a cheque:
          <br />
          Please make all cheques payable to Woodcraft Folk
          <br />
          If you are paying by cheque please email <Link href={'mailto:info@venturercamp.org.uk'}>info@venturercamp.org.uk</Link> to let us know you have sent the cheque and who it is paying for.
        </Text>
        <Text>
          Post your cheque to:
          <br />
          Woodcraft Folk
          <br />
          Holyoake House
          <br />
          Hanover Street
          <br />
          Manchester <br />
          M60 0AS
        </Text>
        <Text>
          <b>
            For any questions contact the Venturer Camp team on <Link href={'mailto:info@venturercamp.org.uk'}>info@venturercamp.org.uk</Link>
          </b>
        </Text>
      </Html>
    )
  }
}
