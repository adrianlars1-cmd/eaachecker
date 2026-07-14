import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../db/prisma.js'
import { optionalAuth, requireAuth } from '../middleware/auth.js'
import { scanRateLimiter } from '../middleware/rateLimiter.js'
import { validateUrl, ScanValidationError } from '../services/scanner/urlValidator.js'
import { runFullScan } from '../services/scanner/runFullScan.js'
import { LANGUAGES } from '../services/ai/prompts/languages.js'
import { logger } from '../utils/logger.js'

const router = Router()

const createScanSchema = z.object({
  url: z.string().min(1),
  language: z.enum(Object.keys(LANGUAGES)).default('sv'),
})

router.post('/scan', optionalAuth, scanRateLimiter, async (req, res) => {
  const parsed = createScanSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Please provide a valid URL.' })
  }

  let normalizedUrl
  try {
    normalizedUrl = await validateUrl(parsed.data.url)
  } catch (err) {
    if (err instanceof ScanValidationError) return res.status(400).json({ error: err.message })
    throw err
  }

  const scan = await prisma.scan.create({
    data: {
      url: normalizedUrl,
      language: parsed.data.language,
      userId: req.user?.id ?? null,
      status: 'pending',
    },
  })

  runFullScan(scan.id).catch((err) => logger.error({ err, scanId: scan.id }, 'runFullScan crashed unexpectedly'))

  res.status(202).json({ scanId: scan.id })
})

router.get('/scan/:id', optionalAuth, async (req, res) => {
  const scan = await prisma.scan.findUnique({ where: { id: req.params.id } })
  if (!scan) return res.status(404).json({ error: 'Scan not found' })
  res.json({
    id: scan.id,
    url: scan.url,
    status: scan.status,
    errorMessage: scan.errorMessage,
    score: scan.score,
  })
})

router.patch('/scan/:id/claim', requireAuth, async (req, res) => {
  const scan = await prisma.scan.findUnique({ where: { id: req.params.id } })
  if (!scan) return res.status(404).json({ error: 'Scan not found' })
  if (scan.userId && scan.userId !== req.user.id) {
    return res.status(403).json({ error: 'This scan already belongs to another account.' })
  }

  const updated = await prisma.scan.update({
    where: { id: scan.id },
    data: { userId: req.user.id },
  })
  res.json({ id: updated.id })
})

export default router
