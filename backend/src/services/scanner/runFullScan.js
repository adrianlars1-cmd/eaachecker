import { prisma } from '../../db/prisma.js'
import { logger } from '../../utils/logger.js'
import { launchScanBrowser, SCAN_USER_AGENT } from './browserPool.js'
import { runAxe } from './axeRunner.js'
import { runLighthouse } from './lighthouseRunner.js'
import { calculateScore, estimateFineRange } from './scoreCalculator.js'
import { assertUrlStillSafe } from './urlValidator.js'
import { summarizeForClaude } from '../ai/summarizeForClaude.js'
import { generateFreeSummary } from '../ai/generateFreeSummary.js'

const NAVIGATION_TIMEOUT_MS = 20_000
const MAX_RESPONSE_BYTES = 15 * 1024 * 1024

/**
 * Runs the full free-scan pipeline for an existing Scan row and persists the
 * result. Never throws — all failures are recorded on the Scan row itself so
 * the caller can fire-and-forget this.
 */
export async function runFullScan(scanId) {
  const scan = await prisma.scan.findUnique({ where: { id: scanId } })
  if (!scan) return

  await prisma.scan.update({ where: { id: scanId }, data: { status: 'running' } })

  let browser
  try {
    browser = await launchScanBrowser()
    const context = await browser.newContext({ userAgent: SCAN_USER_AGENT })
    const page = await context.newPage()
    page.setDefaultNavigationTimeout(NAVIGATION_TIMEOUT_MS)

    let abortedForSize = false
    page.on('response', (response) => {
      const contentLength = Number(response.headers()['content-length'] || 0)
      if (contentLength > MAX_RESPONSE_BYTES) abortedForSize = true
    })

    await page.goto(scan.url, { waitUntil: 'load', timeout: NAVIGATION_TIMEOUT_MS })

    if (abortedForSize) {
      throw new Error('The page response was too large to scan safely.')
    }
    await assertUrlStillSafe(page.url())

    const axeResults = await runAxe(page)
    const lhr = await runLighthouse(scan.url)

    const summary = summarizeForClaude(scan.url, axeResults, lhr)
    const score = calculateScore(axeResults, lhr)
    const fineRange = estimateFineRange(score)
    const aiFreeSummary = await generateFreeSummary(summary, scan.language)

    await prisma.scan.update({
      where: { id: scanId },
      data: {
        status: 'completed',
        score,
        estimatedFineMin: fineRange.min,
        estimatedFineMax: fineRange.max,
        rawAxeResults: axeResults,
        rawLighthouseResults: lhr,
        summaryForAI: summary,
        aiFreeSummary,
        completedAt: new Date(),
      },
    })
  } catch (err) {
    logger.error({ err, scanId, url: scan.url }, 'Scan failed')
    await prisma.scan.update({
      where: { id: scanId },
      data: {
        status: 'failed',
        errorMessage: userFacingError(err),
        completedAt: new Date(),
      },
    })
  } finally {
    if (browser) await browser.close().catch(() => {})
  }
}

function userFacingError(err) {
  if (err?.name === 'ScanValidationError') return err.message
  if (err?.name === 'TimeoutError' || /Timeout/i.test(err?.message || '')) {
    return 'The site took too long to respond. It may be slow or blocking automated scanners.'
  }
  return 'We could not scan that site. It may block automated scanners or be temporarily unavailable.'
}
