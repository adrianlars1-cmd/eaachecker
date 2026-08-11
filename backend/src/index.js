import express from 'express'
import cors from 'cors'
import { env } from './config/env.js'
import { logger } from './utils/logger.js'
import { errorHandler } from './middleware/errorHandler.js'
import { startRescanCron } from './services/cron/rescanJob.js'

import authRoutes from './routes/auth.routes.js'
import userRoutes from './routes/user.routes.js'
import scanRoutes from './routes/scan.routes.js'
import reportRoutes from './routes/report.routes.js'
import billingRoutes, { stripeWebhookHandler } from './routes/billing.routes.js'

const app = express()

// Render (and most PaaS hosts) sit behind a reverse proxy — without this,
// express-rate-limit can't reliably read the real client IP from X-Forwarded-For.
app.set('trust proxy', 1)

app.use(cors({ origin: env.FRONTEND_URL }))

// Stripe webhook needs the raw request body for signature verification, so it
// must be mounted before the global JSON body parser below.
app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), stripeWebhookHandler)

app.use(express.json())

app.get('/health', (_req, res) => res.json({ ok: true }))

app.use('/api/auth', authRoutes)
app.use('/api', userRoutes)
app.use('/api', scanRoutes)
app.use('/api', reportRoutes)
app.use('/api/billing', billingRoutes)

app.use(errorHandler)

app.listen(env.PORT, () => {
  logger.info(`EAAChecker backend listening on port ${env.PORT}`)
  startRescanCron()
})
