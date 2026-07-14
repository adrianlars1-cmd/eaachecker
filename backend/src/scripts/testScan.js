// Standalone smoke test for the scan pipeline — no database or Anthropic API
// key required. Usage: npm run test:scan -- https://example.com
import { validateUrl, assertUrlStillSafe } from '../services/scanner/urlValidator.js'
import { launchScanBrowser, SCAN_USER_AGENT } from '../services/scanner/browserPool.js'
import { runAxe } from '../services/scanner/axeRunner.js'
import { runLighthouse } from '../services/scanner/lighthouseRunner.js'
import { calculateScore, estimateFineRange } from '../services/scanner/scoreCalculator.js'

const rawUrl = process.argv[2]
if (!rawUrl) {
  console.error('Usage: npm run test:scan -- <url>')
  process.exit(1)
}

const url = await validateUrl(rawUrl)
console.log(`Validated URL: ${url}`)

const browser = await launchScanBrowser()
try {
  const page = await browser.newContext({ userAgent: SCAN_USER_AGENT }).then((ctx) => ctx.newPage())
  page.setDefaultNavigationTimeout(20_000)
  await page.goto(url, { waitUntil: 'load', timeout: 20_000 })
  await assertUrlStillSafe(page.url())

  console.log('Running axe-core…')
  const axeResults = await runAxe(page)
  console.log(`  ${axeResults.violations.length} violation types found`)

  console.log('Running Lighthouse…')
  const lhr = await runLighthouse(url)
  console.log(`  accessibility score: ${Math.round((lhr.categories.accessibility?.score ?? 0) * 100)}/100`)

  const score = calculateScore(axeResults, lhr)
  const fineRange = estimateFineRange(score)
  console.log(`\nFinal blended score: ${score}/100`)
  console.log(`Estimated fine-risk range: €${fineRange.min} – €${fineRange.max}`)
} finally {
  await browser.close()
}
