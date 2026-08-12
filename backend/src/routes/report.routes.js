import { Router } from 'express'
import { prisma } from '../db/prisma.js'
import { hasActiveAccess, requireAuth } from '../middleware/auth.js'
import { generateFullReport } from '../services/ai/generateFullReport.js'
import { generateReportPdf } from '../services/pdf/generateReportPdf.js'
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

// PDF export — subscriber-only, requires the requesting user to own the scan.
router.get('/report/:id/pdf', requireAuth, async (req, res) => {
  const scan = await prisma.scan.findUnique({ where: { id: req.params.id } })
  if (!scan) return res.status(404).json({ error: 'Report not found' })
  if (scan.userId !== req.user.id) return res.status(403).json({ error: 'You do not have access to this report.' })
  if (scan.status !== 'completed') return res.status(400).json({ error: 'This scan has not completed yet.' })
  if (!hasActiveAccess(req.user)) return res.status(402).json({ error: 'A subscription is required to download the PDF report.' })

  let aiFullReport = scan.aiFullReport
  if (!aiFullReport) {
    try {
      aiFullReport = await generateFullReport(scan.summaryForAI, scan.language)
      await prisma.scan.update({ where: { id: scan.id }, data: { aiFullReport } })
    } catch (err) {
      logger.error({ err, scanId: scan.id }, 'Failed to generate full report for PDF export')
      return res.status(500).json({ error: 'Could not generate the full report. Please try again.' })
    }
  }

  try {
    const pdfBuffer = await generateReportPdf({ ...scan, aiFullReport })
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="eaachecker-report-${scan.id}.pdf"`)
    res.send(pdfBuffer)
  } catch (err) {
    logger.error({ err, scanId: scan.id }, 'Failed to render PDF')
    res.status(500).json({ error: 'Could not generate the PDF. Please try again shortly.' })
  }
})

export default router
