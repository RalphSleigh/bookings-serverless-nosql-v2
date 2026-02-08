import { subject } from '@casl/ability'
import { CreateEntityItem, EntityIdentifiers, UpdateEntityItem } from 'electrodb'
import { isEqual } from 'lodash-es'
import Stripe from 'stripe'

import { generateDiscordDiff } from '../../../shared/bookingDiff'
import { getFeeType } from '../../../shared/fees/fees'
import { BookingSchema, TBooking } from '../../../shared/schemas/booking'
import { enqueueAsyncTask } from '../../asyncTasks/asyncTaskQueuer'
import { DB, DBBooking, DBBookingHistory, DBPerson, DBPersonHistory } from '../../dynamo'
import { HandlerWrapper, HandlerWrapperLoggedIn } from '../../utils'

export const redirectToStripe = HandlerWrapperLoggedIn(
  (req, res) => ['update', subject('eventBooking', { event: res.locals.event, booking: res.locals.booking })],
  async (req, res) => {
    const user = res.locals.user
    const event = res.locals.event
    const booking = res.locals.booking
    const fees = res.locals.fees
    const config = res.locals.config

    const fee = getFeeType(event)

    const outstanding =
      fee.getFeeLines(event, booking).reduce((sum, line) => sum + line.amount, 0) +
      fees.filter((f) => f.type === 'adjustment').reduce((sum, f) => sum + f.amount, 0) -
      fees.filter((f) => f.type === 'payment').reduce((sum, f) => sum + f.amount, 0)

    console.log(`Total outstanding: ${outstanding}`)

    if (outstanding <= 0) {
      throw new Error('No outstanding amount to pay')
    }

    const description =
      fee
        .getFeeLines(event, booking)
        .map((f) => f.label)
        .join(', ') + `, ${fee.getPaymentReference(booking)}`

    const stripe = new Stripe(config.STRIPE_SECRET_KEY)

    const session = await stripe!.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: `${event.name} booking for ${booking.basic.name}`,
              description: description,
            },
            unit_amount: outstanding * 100,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${config.BASE_URL}`,
      cancel_url: `${config.BASE_URL}`,
      payment_intent_data: {
        metadata: {
          eventId: event.eventId,
          userId: user.userId,
        },
        receipt_email: user.email,
      },
    })

    if (!session.url) {
      throw new Error('Failed to create Stripe checkout session')
    }

    res.redirect(session.url)
  },
)
