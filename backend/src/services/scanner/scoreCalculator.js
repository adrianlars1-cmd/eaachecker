const IMPACT_WEIGHTS = { critical: 6, serious: 4, moderate: 2, minor: 1 }

/**
 * Blends Lighthouse's accessibility category score with a penalty derived from
 * distinct axe-core violation rules (axe is more thorough for strict WCAG
 * conformance than Lighthouse's own built-in a11y audits).
 */
export function calculateScore(axeResults, lhr) {
  const base = Math.round((lhr?.categories?.accessibility?.score ?? 0.5) * 100)
  const violations = axeResults?.violations || []
  const penalty = violations.reduce((sum, v) => sum + (IMPACT_WEIGHTS[v.impact] || 1), 0)
  return Math.max(0, Math.min(100, base - penalty))
}

/**
 * Rough, non-legal fine-risk bucket for the free report, per the business case's
 * cited EU/EEA ranges (up to ~€200,000 in the strictest markets). Not a legal estimate.
 */
export function estimateFineRange(score) {
  if (score >= 90) return { min: 0, max: 0 }
  if (score >= 70) return { min: 5000, max: 20000 }
  if (score >= 50) return { min: 10000, max: 50000 }
  return { min: 20000, max: 200000 }
}
