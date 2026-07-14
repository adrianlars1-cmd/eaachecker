import { prisma } from '../../db/prisma.js'
import { sendPaymentFailedEmail } from '../email/templates.js'
import { logger } from '../../utils/logger.js'

async function upsertSubscriptionFromStripe(userId, sub) {
  const priceId = sub.items.data[0]?.price?.id
  const currentPeriodEnd = new Date(sub.current_period_end * 1000)

  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeSubscriptionId: sub.id,
      stripePriceId: priceId,
      status: sub.status,
      currentPeriodEnd,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    },
    update: {
      stripeSubscriptionId: sub.id,
      stripePriceId: priceId,
      status: sub.status,
      currentPeriodEnd,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
    },
  })
}

export async function handleCheckoutSessionCompleted(session, stripe) {
  const userId = session.client_reference_id
  if (!userId) {
    logger.warn({ sessionId: session.id }, 'Checkout session completed without client_reference_id')
    return
  }

  await prisma.user.update({ where: { id: userId }, data: { stripeCustomerId: session.customer } })
  const sub = await stripe.subscriptions.retrieve(session.subscription)
  await upsertSubscriptionFromStripe(userId, sub)
}

export async function handleSubscriptionUpdated(subscription) {
  const user = await prisma.user.findUnique({ where: { stripeCustomerId: subscription.customer } })
  if (!user) return
  await upsertSubscriptionFromStripe(user.id, subscription)
}

export async function handleSubscriptionDeleted(subscription) {
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: { status: 'canceled' },
  })
}

export async function handleInvoicePaymentFailed(invoice) {
  const user = await prisma.user.findUnique({ where: { stripeCustomerId: invoice.customer } })
  if (!user) return

  await prisma.subscription.updateMany({
    where: { userId: user.id },
    data: { status: 'past_due' },
  })
  await sendPaymentFailedEmail(user.email).catch((err) => logger.error({ err }, 'Failed to send payment-failed email'))
}
