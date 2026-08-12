import { Router } from 'express'
import { stripe } from '../services/billing/stripeClient.js'
import { env } from '../config/env.js'
import { requireAuth } from '../middleware/auth.js'
import { logger } from '../utils/logger.js'
import { withRetry } from '../utils/retry.js'
import {
  handleCheckoutSessionCompleted,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  handleInvoicePaymentFailed,
} from '../services/billing/subscriptionSync.js'

const router = Router()

router.post('/checkout-session', requireAuth, async (req, res) => {
  try {
    const session = await withRetry(() =>
      stripe.checkout.sessions.create({
        mode: 'subscription',
        customer: req.user.stripeCustomerId || undefined,
        client_reference_id: req.user.id,
        line_items: [{ price: env.STRIPE_PRICE_ID, quantity: 1 }],
        success_url: `${env.FRONTEND_URL}/account?checkout=success`,
        cancel_url: `${env.FRONTEND_URL}/pricing?checkout=cancelled`,
      }),
    )
    res.json({ url: session.url })
  } catch (err) {
    logger.error({ err }, 'Failed to create Stripe checkout session')
    res.status(502).json({ error: 'Could not start checkout right now. Please try again shortly.' })
  }
})

router.post('/portal-session', requireAuth, async (req, res) => {
  if (!req.user.stripeCustomerId) {
    return res.status(400).json({ error: 'No billing account found. Subscribe first.' })
  }
  try {
    const session = await withRetry(() =>
      stripe.billingPortal.sessions.create({
        customer: req.user.stripeCustomerId,
        return_url: `${env.FRONTEND_URL}/account`,
      }),
    )
    res.json({ url: session.url })
  } catch (err) {
    logger.error({ err }, 'Failed to create Stripe portal session')
    res.status(502).json({ error: 'Could not open the billing portal right now. Please try again shortly.' })
  }
})

// Mounted separately in index.js with express.raw() BEFORE the global JSON
// body parser — Stripe signature verification requires the raw request body.
export async function stripeWebhookHandler(req, res) {
  let event
  try {
    const signature = req.headers['stripe-signature']
    event = stripe.webhooks.constructEvent(req.body, signature, env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    logger.warn({ err }, 'Stripe webhook signature verification failed')
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object, stripe)
        break
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object)
        break
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object)
        break
      default:
        break
    }
  } catch (err) {
    logger.error({ err, eventType: event.type }, 'Error processing Stripe webhook event')
  }

  res.json({ received: true })
}

export default router
