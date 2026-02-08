import e, { RequestHandler } from 'express'
import Stripe from 'stripe'

import { FeeForCreateSchema } from '../../shared/schemas/fees'
import { enqueueAsyncTask } from '../asyncTasks/asyncTaskQueuer'
import { DBBooking, DBFee } from '../dynamo'
import { ConfigType } from '../getConfig'

export const stripeWebhookHandler: RequestHandler = async (req, res) => {
    try {
  const config = res.locals.config as ConfigType

  const stripe = new Stripe(config.STRIPE_SECRET_KEY)

  const sigHeader = req.headers['Stripe-Signature'] || req.headers['stripe-signature']

  console.log(req.body)
  //@ts-expect-error
  const event = stripe.webhooks.constructEvent(req.rawBody!, sigHeader!, config.STRIPE_WEBHOOK_SECRET)

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object
    if (!paymentIntent.metadata.eventId || !paymentIntent.metadata.userId) return res.status(200).send()

    const booking = await DBBooking.get({ eventId: paymentIntent.metadata.eventId, userId: paymentIntent.metadata.userId }).go()
    if (booking.data) {
      const validatedFee = FeeForCreateSchema.parse({
        eventId: booking.data.eventId,
        userId: paymentIntent.metadata.userId,
        type: 'payment',
        amount: paymentIntent.amount_received / 100,
        note: `Payment from Stripe on ${new Date().toISOString().slice(0, 10)}`,
        createdAt: Date.now(),
      })

      await DBFee.create(validatedFee).go()

      await enqueueAsyncTask({
        type: 'discordMessage',
        data: {
          message: `Stripe payment of £${paymentIntent.amount_received / 100} received from booking ${booking.data.basic?.name} (${booking.data.basic?.district ? booking.data.basic.district : 'Individual'})`,
        },
      })
    }
  }
  return res.status(200).send()
} catch (error) {
    console.log(error)
    res.locals.logger.logToPath('Stripe webhook failed')
    res.locals.logger.logToPath(error)
    return res.status(500).send()
  }
}
