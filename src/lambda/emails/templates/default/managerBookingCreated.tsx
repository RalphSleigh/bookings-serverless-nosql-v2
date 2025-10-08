import * as React from 'react';
import { Html, Text, Link } from '@react-email/components';
import { EmailTemplate } from '../template';
import { BookingEmailData } from '../../sendEmail';
import { ConfigType } from '../../../getConfig';


export class ManagerConfirmationEmail extends EmailTemplate {
    subject(data: BookingEmailData) {
        return `[${data.event.emailSubjectTag}] Booking Added`
    }

    HTMLBody(data: BookingEmailData, config: ConfigType) {
        const participantsList = data.booking.people.map((p, i) => <li key={i} style={{ fontSize: "14px" }}>{p.basic.name}</li>);

        return (<Html lang="en">
            <Text>Hi {data.recipient.name}</Text>
            <Text>{data.bookingOwner.name} has added a new booking to {data.event.name}. They have
                booked {data.booking.people.length} {data.booking.people.length === 1 ? 'person' : 'people'}</Text>
            <ul>{participantsList}</ul>
            <Text>
                <p>Blue Skies and Friendship,</p>
                <p>Woodcraft Folk</p>
            </Text>
        </Html>)
    }
}