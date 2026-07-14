const SEVERITY_STYLES = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-slate-100 text-slate-600',
}

export default function IssueCard({ issue }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-slate-900">{issue.title}</h3>
        <span
          className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
            SEVERITY_STYLES[issue.severity] || SEVERITY_STYLES.low
          }`}
        >
          {issue.severity}
        </span>
      </div>
      {issue.wcagCriterion && (
        <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">
          WCAG {issue.wcagCriterion}
        </p>
      )}
      <p className="mt-2 text-sm text-slate-600">{issue.plainExplanation}</p>
      {issue.howToFix && (
        <p className="mt-2 text-sm text-slate-700">
          <span className="font-medium text-slate-900">How to fix: </span>
          {issue.howToFix}
        </p>
      )}
    </div>
  )
}
