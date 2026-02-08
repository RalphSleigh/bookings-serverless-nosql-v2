import { EmailData } from '../sendEmail'
import { ApplicationApprovedEmail } from './default/applicationApproved'
import { ApplicationReceivedEmail } from './default/applicationReceived'
import { BookingUpdatedEmail } from './default/bookingUpdated'
import { BookingConfirmationEmail } from './default/confirmation'
import { ManagerApplicationReceivedEmail } from './default/managerApplicationReceived'
import { ManagerConfirmationEmail } from './default/managerBookingCreated'
import { ManagerDataAccessEmail } from './default/managerDataAccess'
import { ManagerBookingUpdatedEmail } from './default/managerUpdated'
import { EmailTemplate } from './template'
import { VCampBookingEditedEmail } from './vcamp/bookingUpdated'
import { VCampBookingConfirmationEmail } from './vcamp/confirmation'

const templates: Partial<Record<EmailData['template'], Record<string, EmailTemplate> & { default: EmailTemplate }>> = {
  confirmation: {
    default: new BookingConfirmationEmail(),
    test: new BookingConfirmationEmail(),
    vcamp: new VCampBookingConfirmationEmail()
  },
  updated: {
    default: new BookingUpdatedEmail(),
    vcamp: new VCampBookingEditedEmail(),
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
  return template[data.event.eventId] ?? template[data.event.emailTemplates] ?? template.default
}
