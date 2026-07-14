import { Router } from 'express'
import bcrypt from 'bcrypt'
import { z } from 'zod'
import { prisma } from '../db/prisma.js'
import { signToken } from '../utils/jwt.js'
import { authRateLimiter } from '../middleware/rateLimiter.js'

const router = Router()

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

function serializeUser(user) {
  return {
    id: user.id,
    email: user.email,
    subscription: user.subscription
      ? {
          status: user.subscription.status,
          currentPeriodEnd: user.subscription.currentPeriodEnd,
          cancelAtPeriodEnd: user.subscription.cancelAtPeriodEnd,
        }
      : null,
  }
}

router.post('/register', authRateLimiter, async (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Invalid input' })
  }
  const { email, password } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return res.status(409).json({ error: 'An account with that email already exists.' })

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({ data: { email, passwordHash } })

  const token = signToken(user)
  res.status(201).json({ token, user: serializeUser(user) })
})

router.post('/login', authRateLimiter, async (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid email or password.' })
  }
  const { email, password } = parsed.data

  const user = await prisma.user.findUnique({ where: { email }, include: { subscription: true } })
  if (!user) return res.status(401).json({ error: 'Invalid email or password.' })

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return res.status(401).json({ error: 'Invalid email or password.' })

  const token = signToken(user)
  res.json({ token, user: serializeUser(user) })
})

export { serializeUser }
export default router
