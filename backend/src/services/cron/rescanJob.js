import cron from 'node-cron'
import { prisma } from '../../db/prisma.js'
import { runFullScan } from '../scanner/runFullScan.js'
import { sendRescanAlertEmail } from '../email/templates.js'
import { logger } from '../../utils/logger.js'
import { env } from '../../config/env.js'

const RESCAN_INTERVAL_DAYS = 30

async function findSubscriptionsDueForRescan() {
  const cutoff = new Date(Date.now() - RESCAN_INTERVAL_DAYS * 24 * 60 * 60 * 1000)

  const subscriptions = await prisma.subscription.findMany({
    where: { status: { in: ['active', 'trialing'] } },
    include: {
      user: {
        include: { scans: { orderBy: { createdAt: 'desc' }, take: 1 } },
      },
    },
  })

  return subscriptions
    .map((sub) => ({ user: sub.user, lastScan: sub.user.scans[0] }))
    .filter(({ lastScan }) => lastScan && lastScan.status === 'completed' && lastScan.createdAt <= cutoff)
}

function extractRuleIds(summary) {
  const ids = new Set()
  for (const bucket of Object.values(summary?.violationsByImpact || {})) {
    for (const v of bucket) ids.add(v.ruleId)
  }
  return ids
}

async function rescanOne({ user, lastScan }) {
  const newScan = await prisma.scan.create({
    data: {
      url: lastScan.url,
      language: lastScan.language,
      userId: user.id,
      status: 'pending',
      isRescan: true,
      parentScanId: lastScan.id,
    },
  })

  await runFullScan(newScan.id)

  const completed = await prisma.scan.findUnique({ where: { id: newScan.id } })
  if (completed.status !== 'completed') return

  const oldRuleIds = extractRuleIds(lastScan.summaryForAI)
  const newRuleIds = extractRuleIds(completed.summaryForAI)
  const newIssueCount = [...newRuleIds].filter((id) => !oldRuleIds.has(id)).length

  await sendRescanAlertEmail(user.email, {
    url: completed.url,
    previousScore: lastScan.score,
    newScore: completed.score,
    newIssueCount,
  }).catch((err) => logger.error({ err, userId: user.id }, 'Failed to send rescan alert email'))
}

export function startRescanCron() {
  if (env.NODE_ENV !== 'production' && !env.ENABLE_CRON_DEV) {
    logger.info('Rescan cron disabled in development (set ENABLE_CRON_DEV=true to enable)')
    return
  }

  // Daily at 03:00 UTC — checked against a 30-day-since-last-scan guard rather
  // than firing once a month, so a missed/delayed deploy doesn't skip a cycle.
  cron.schedule('0 3 * * *', async () => {
    const due = await findSubscriptionsDueForRescan()
    logger.info({ count: due.length }, 'Running scheduled re-scans')
    for (const entry of due) {
      try {
        await rescanOne(entry)
      } catch (err) {
        logger.error({ err, userId: entry.user.id }, 'Scheduled re-scan failed')
      }
    }
  })
}
