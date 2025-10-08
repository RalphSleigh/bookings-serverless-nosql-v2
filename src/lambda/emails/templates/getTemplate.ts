import { EmailData } from '../sendEmail'
import { BookingConfirmationEmail } from './default/confirmation'
import { ManagerConfirmationEmail } from './default/managerBookingCreated'
import { ManagerBookingUpdatedEmail } from './default/managerUpdated'
import { BookingUpdatedEmail } from './default/updated'
import { EmailTemplate } from './template'

const templates: Record<EmailData['template'], Record<string, EmailTemplate> & { default: EmailTemplate }> = {
  confirmation: {
    default: new BookingConfirmationEmail(),
    test: new BookingConfirmationEmail(),
  },
  updated: {
    default: new BookingUpdatedEmail(),
  },
  managerConfirmation: {
    default: new ManagerConfirmationEmail(),
  },
  managerBookingUpdated: {
    default: new ManagerBookingUpdatedEmail(),
  },
}

export const getEmailTemplate: (data: EmailData) => EmailTemplate = (data) => {
  const template = templates[data.template]
  return template[data.event.eventId] ? template[data.event.eventId] : template.default
}
