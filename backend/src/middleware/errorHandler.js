import { logger } from '../utils/logger.js'

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  logger.error({ err, path: req.path }, 'Unhandled request error')
  if (res.headersSent) return
  res.status(err.status || 500).json({ error: err.publicMessage || 'Something went wrong. Please try again.' })
}
