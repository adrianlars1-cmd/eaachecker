import rateLimit from 'express-rate-limit'

export const scanRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: (req) => (req.user ? 30 : 5),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many scans from this address. Please try again later.' },
})

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts. Please try again later.' },
})
