import { Router } from 'express'
import { prisma } from '../db/prisma.js'
import { requireAuth } from '../middleware/auth.js'
import { serializeUser } from './auth.routes.js'

const router = Router()

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: serializeUser(req.user) })
})

router.get('/me/scans', requireAuth, async (req, res) => {
  const scans = await prisma.scan.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
    select: { id: true, url: true, status: true, score: true, createdAt: true },
  })
  res.json({ scans })
})

export default router
