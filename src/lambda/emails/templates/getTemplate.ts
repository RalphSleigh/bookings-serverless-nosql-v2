import { EmailData } from '../sendEmail'
import { ApplicationApprovedEmail } from './default/applicationApproved'
import { ApplicationReceivedEmail } from './default/applicationReceived'
import { BookingConfirmationEmail } from './default/confirmation'
import { ManagerApplicationReceivedEmail } from './default/managerApplicationReceived'
import { ManagerConfirmationEmail } from './default/managerBookingCreated'
import { ManagerDataAccessEmail } from './default/managerDataAccess'
import { ManagerBookingUpdatedEmail } from './default/managerUpdated'
import { BookingUpdatedEmail } from './default/updated'
import { EmailTemplate } from './template'

const templates: Partial<Record<EmailData['template'], Record<string, EmailTemplate> & { default: EmailTemplate }>> = {
  confirmation: {
    default: new BookingConfirmationEmail(),
    test: new BookingConfirmationEmail(),
  },
  updated: {
    default: new BookingUpdatedEmail(),
  },
  applicationReceived: {
    default: new ApplicationReceivedEmail(),
  },
  applicationApproved: {
    default: new ApplicationApprovedEmail(),
  },
  managerApplicationReceived: {
    default: new ManagerApplicationReceivedEmail(),
  },
  managerConfirmation: {
    default: new ManagerConfirmationEmail(),
  },
  managerBookingUpdated: {
    default: new ManagerBookingUpdatedEmail(),
  },
  managerDataAccess: {
    default: new ManagerDataAccessEmail(),
  },
}

export const getEmailTemplate: (data: EmailData) => EmailTemplate = (data) => {
  const template = templates[data.template]
  if (!template) throw new Error(`No template found for ${data.template}`)
  return template[data.event.eventId] ? template[data.event.eventId] : template.default
}
