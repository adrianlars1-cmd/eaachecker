const WCAG_TAG_RE = /^wcag(\d)(\d)(\d{1,2})$/

function tagsToWcagCriteria(tags) {
  const criteria = []
  for (const tag of tags) {
    const match = WCAG_TAG_RE.exec(tag)
    if (match) criteria.push(`${match[1]}.${match[2]}.${match[3]}`)
  }
  return criteria
}

/**
 * Collapses raw axe-core + Lighthouse output (often 100KB+ of DOM snippets and
 * metadata) into a compact object safe to send to an LLM: grouped by rule, one
 * sample selector per rule, no raw DOM node arrays.
 */
export function summarizeForClaude(url, axeResults, lhr) {
  const violations = axeResults?.violations || []

  const violationsByImpact = { critical: [], serious: [], moderate: [], minor: [] }
  for (const v of violations) {
    const impact = v.impact || 'minor'
    const bucket = violationsByImpact[impact] || violationsByImpact.minor
    bucket.push({
      ruleId: v.id,
      impact,
      wcagCriteria: tagsToWcagCriteria(v.tags || []),
      count: v.nodes?.length || 0,
      sampleSelector: v.nodes?.[0]?.target?.join(' ') || null,
      helpText: v.help,
    })
  }

  return {
    url,
    violationsByImpact,
    totalViolations: violations.length,
    lighthouseAccessibilityScore: Math.round((lhr?.categories?.accessibility?.score ?? 0) * 100),
    lighthouseBestPracticesScore: Math.round((lhr?.categories?.['best-practices']?.score ?? 0) * 100),
  }
}
