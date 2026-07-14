import { Router } from 'express'
import { prisma } from '../db/prisma.js'
import { hasActiveAccess } from '../middleware/auth.js'
import { generateFullReport } from '../services/ai/generateFullReport.js'
import { logger } from '../utils/logger.js'

const router = Router()

// Public endpoint — reports are shareable links, no auth required to view them.
router.get('/report/:id', async (req, res) => {
  const scan = await prisma.scan.findUnique({
    where: { id: req.params.id },
    include: { user: { include: { subscription: true } } },
  })
  if (!scan) return res.status(404).json({ error: 'Report not found' })

  const base = {
    id: scan.id,
    url: scan.url,
    status: scan.status,
    errorMessage: scan.errorMessage,
    score: scan.score,
    estimatedFineMin: scan.estimatedFineMin,
    estimatedFineMax: scan.estimatedFineMax,
    aiFreeSummary: scan.aiFreeSummary,
    createdAt: scan.createdAt,
  }

  if (scan.status !== 'completed') return res.json(base)

  const unlocked = hasActiveAccess(scan.user)
  if (!unlocked) return res.json({ ...base, fullReportUnlocked: false })

  let aiFullReport = scan.aiFullReport
  if (!aiFullReport) {
    try {
      aiFullReport = await generateFullReport(scan.summaryForAI, scan.language)
      await prisma.scan.update({ where: { id: scan.id }, data: { aiFullReport } })
    } catch (err) {
      logger.error({ err, scanId: scan.id }, 'Failed to generate full report')
      return res.json({ ...base, fullReportUnlocked: true, aiFullReport: null })
    }
  }

  res.json({ ...base, fullReportUnlocked: true, aiFullReport })
})

export default router
