import sgMail from '@sendgrid/mail'
import { env, isProduction } from '../../config/env.js'
import { logger } from '../../utils/logger.js'

sgMail.setApiKey(env.SENDGRID_API_KEY)

const isDummyKey = env.SENDGRID_API_KEY === 'SG.dummy'

export async function sendEmail({ to, subject, html }) {
  if (isDummyKey && !isProduction) {
    logger.info({ to, subject }, '[dev email — SENDGRID_API_KEY not set] would have sent')
    return
  }

  await sgMail.send({ to, from: env.SENDGRID_FROM_EMAIL, subject, html })
}
