import { gmail } from '@googleapis/gmail'
import { render } from '@react-email/render'
import { backOff } from 'exponential-backoff'
import MailComposer from 'nodemailer/lib/mail-composer/index.js'
import { EventType } from 'react-hook-form'

import { TBooking } from '../../shared/schemas/booking'
import { TEvent } from '../../shared/schemas/event'
import { TUser } from '../../shared/schemas/user'
import { ConfigType } from '../getConfig'
import { getAuthClientForScope } from '../googleAuthClientHack'
import { am_in_lambda } from '../utils'
import { getEmailTemplate } from './templates/getTemplate'

export type BasicEmailData = {
  template: 'managerDataAccess' | 'applicationReceived' | 'applicationApproved'
  recipient: TUser
  event: TEvent
}

export type ApplicationEmailData = {
  template: 'managerApplicationReceived'
  recipient: TUser
  event: TEvent
  bookingOwner: TUser
}

export type BookingEmailData = {
  template: 'confirmation' | 'updated' | 'managerConfirmation' | 'managerBookingUpdated' | 'managerBookingCancelled'
  recipient: TUser
  event: TEvent
  booking: TBooking
  bookingOwner: TUser
}

export type BookingManagerEmailData = {
  template: 'managerManagerBookingEdited'
  recipient: TUser
  event: TEvent
  booking: TBooking
  bookingOwner: TUser
  bookingEditor: TUser
}

export type EmailData = BasicEmailData | BookingEmailData | ApplicationEmailData | BookingManagerEmailData

const googlePoolConf = {
  universe_domain: 'googleapis.com',
  type: 'external_account',
  audience: '//iam.googleapis.com/projects/972679295752/locations/global/workloadIdentityPools/aws-root-account/providers/aws-root-provider',
  subject_token_type: 'urn:ietf:params:aws:token-type:aws4_request',
  service_account_impersonation_url: 'https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/service-account@woodcraft-folk-bookings-2025.iam.gserviceaccount.com:generateAccessToken',
  token_url: 'https://sts.googleapis.com/v1/token',
  credential_source: {
    environment_id: 'aws1',
    region_url: 'http://169.254.169.254/latest/meta-data/placement/availability-zone',
    url: 'http://169.254.169.254/latest/meta-data/iam/security-credentials',
    regional_cred_verification_url: 'https://sts.{region}.amazonaws.com?Action=GetCallerIdentity&Version=2011-06-15',
  },
}

export async function sendEmail(data: EmailData, config: ConfigType) {
  try {

    if (!config.EMAIL_ENABLED) {
      console.log('Email not enabled, not sending email')
      return
    }

    const { recipient, event } = data

    if (!recipient!.email) {
      console.log('no email address')
      return
    }

    console.log(`Sending email ${data.template} to ${recipient!.email}`)

    const template = getEmailTemplate(data)

    //@ts-ignore
    const subject = template.subject(data)
    //@ts-ignore
    const htmlEmail = template.HTMLBody(data, config)
    const htmlEmailText = await render(htmlEmail)
    const textEmailText = await render(htmlEmail, { plainText: true })

    const mail_options = {
      from: `Woodcraft Folk Bookings <${config.GOOGLE_WORKSPACE_EMAIL}>`,
      sender: config.GOOGLE_WORKSPACE_EMAIL,
      replyTo: event.replyTo,
      to: recipient!.email,
      subject: subject,
      html: htmlEmailText,
      text: textEmailText,
    }

    const message = await new MailComposer(mail_options).compile().build()

    const oauth2Client = await getAuthClientForScope(config, ['https://www.googleapis.com/auth/gmail.send'])

    const gmail_instance = gmail({ version: 'v1', auth: oauth2Client })

    await backOff(
      () => {
        console.log('send attempt')
        return gmail_instance.users.messages.send({
          auth: oauth2Client,
          userId: 'bookings-auto@woodcraft.org.uk',
          media: {
            body: message,
            mimeType: 'message/rfc822',
          },
        })
      },
      { startingDelay: 2000, numOfAttempts: 2 },
    )
  } catch (e) {
    console.log('error in sendEmail')
    console.log(e)
    if (am_in_lambda()) throw e // Only throw if we're in lambda, so it errors
  }
}
