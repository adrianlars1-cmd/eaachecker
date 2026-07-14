import { verifyToken } from '../utils/jwt.js'
import { prisma } from '../db/prisma.js'

function extractToken(req) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) return null
  return header.slice('Bearer '.length)
}

export async function requireAuth(req, res, next) {
  const token = extractToken(req)
  if (!token) return res.status(401).json({ error: 'Not authenticated' })

  try {
    const payload = verifyToken(token)
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { subscription: true },
    })
    if (!user) return res.status(401).json({ error: 'Not authenticated' })
    req.user = user
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session' })
  }
}

export async function optionalAuth(req, _res, next) {
  const token = extractToken(req)
  if (!token) return next()

  try {
    const payload = verifyToken(token)
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { subscription: true },
    })
    if (user) req.user = user
  } catch {
    // ignore invalid token for optional auth
  }
  next()
}

export function hasActiveAccess(user) {
  const status = user?.subscription?.status
  return status === 'active' || status === 'trialing'
}
