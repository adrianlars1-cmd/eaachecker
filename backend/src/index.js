import 'express-async-errors'
import express from 'express'
import cors from 'cors'
import { env } from './config/env.js'
import { logger } from './utils/logger.js'
import { errorHandler } from './middleware/errorHandler.js'
import { startRescanCron } from './services/cron/rescanJob.js'

// A rejected promise anywhere that somehow escapes express-async-errors would
// otherwise crash the whole process (and take down every other in-flight
// request with it) — log it and keep the server alive instead.
process.on('unhandledRejection', (err) => {
  logger.error({ err }, 'Unhandled promise rejection')
})

// Some third-party SDKs (seen with Stripe's client when a malformed API key
// hits a low-level http.setHeader call inside a retry timer) throw
// synchronously outside any promise chain, where neither try/catch around an
// await nor 'unhandledRejection' can catch it. This is normally a crash-and-
// exit signal, but for a stateless HTTP server, staying up to keep serving
// other in-flight requests is safer than a hard crash that Render then has to
// notice and restart from scratch, dropping every concurrent request with it.
process.on('uncaughtException', (err) => {
  logger.error({ err }, 'Uncaught exception — process would otherwise have crashed')
})

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
