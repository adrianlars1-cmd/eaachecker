import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ReportAPI } from '../lib/api'
import ScoreGauge from '../components/ScoreGauge'
import IssueCard from '../components/IssueCard'
import LockedSection from '../components/LockedSection'

const POLL_INTERVAL_MS = 2000

export default function ReportPage() {
  const { id } = useParams()
  const [report, setReport] = useState(null)
  const [error, setError] = useState(null)
  const timerRef = useRef(null)

  useEffect(() => {
    let cancelled = false

    async function poll() {
      try {
        const data = await ReportAPI.get(id)
        if (cancelled) return
        setReport(data)
        if (data.status === 'pending' || data.status === 'running') {
          timerRef.current = setTimeout(poll, POLL_INTERVAL_MS)
        }
      } catch {
        if (!cancelled) setError('Report not found.')
      }
    }

    poll()
    return () => {
      cancelled = true
      clearTimeout(timerRef.current)
    }
  }, [id])

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <p className="text-slate-600">{error}</p>
        <Link to="/" className="mt-4 inline-block text-indigo-600 hover:underline">
          Run a new scan
        </Link>
      </div>
    )
  }

  if (!report) {
    return <ScanningState label="Loading report…" />
  }

  if (report.status === 'pending' || report.status === 'running') {
    return <ScanningState label={`Scanning ${report.url || ''}…`} />
  }

  if (report.status === 'failed') {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Scan failed</h1>
        <p className="mt-2 text-slate-600">
          {report.errorMessage || 'We could not scan that site. It may block automated scanners or took too long to respond.'}
        </p>
        <Link to="/" className="mt-6 inline-block text-indigo-600 hover:underline">
          Try another URL
        </Link>
      </div>
    )
  }

  const summary = report.aiFreeSummary || {}
  const topIssues = summary.topIssues || []

  return (
    <>
      <Helmet>
        <title>{`Accessibility report for ${report.url} — EAAChecker`}</title>
        <meta
          name="description"
          content={`WCAG 2.1 AA accessibility score and issues for ${report.url}, checked with EAAChecker.`}
        />
      </Helmet>
      <div className="mx-auto max-w-4xl px-6 py-12">
        <p className="text-sm font-medium text-indigo-600">Accessibility report</p>
        <h1 className="mt-1 break-words text-2xl font-bold text-slate-900">{report.url}</h1>

        <div className="mt-8 flex flex-col items-center gap-6 rounded-xl border border-slate-200 bg-white p-8 sm:flex-row sm:justify-between">
          <ScoreGauge score={report.score ?? 0} />
          <div className="max-w-md text-center sm:text-left">
            <p className="text-slate-700">{summary.plainLanguageSummary}</p>
            {Boolean(report.estimatedFineMin || report.estimatedFineMax) && (
              <p className="mt-3 text-sm text-slate-500">
                Estimated potential fine risk: €{report.estimatedFineMin?.toLocaleString()}
                {report.estimatedFineMax ? ` – €${report.estimatedFineMax.toLocaleString()}` : ''}
              </p>
            )}
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-lg font-semibold text-slate-900">Top {topIssues.length} critical issues</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {topIssues.map((issue, i) => (
              <IssueCard key={i} issue={issue} />
            ))}
          </div>
        </div>

        <div className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Full WCAG 2.1 AA report</h2>
          {report.fullReportUnlocked && report.aiFullReport ? (
            <FullReport report={report.aiFullReport} />
          ) : (
            <LockedSection>
              <FullReport report={{ criteria: Array.from({ length: 6 }, () => ({ id: '1.1.1', name: 'Sample criterion', status: 'pass' })) }} />
            </LockedSection>
          )}
        </div>

        <p className="mt-10 text-center">
          <Link to="/" className="text-sm text-indigo-600 hover:underline">
            Scan another website
          </Link>
        </p>
      </div>
    </>
  )
}

function FullReport({ report }) {
  return (
    <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
      {(report.criteria || []).map((c, i) => (
        <div key={i} className="flex items-center justify-between gap-4 px-4 py-3">
          <div>
            <p className="font-medium text-slate-900">
              {c.id} — {c.name}
            </p>
            {c.explanation && <p className="text-sm text-slate-500">{c.explanation}</p>}
          </div>
          <StatusBadge status={c.status} />
        </div>
      ))}
      {report.accessibilityStatementDraft && (
        <div className="px-4 py-4">
          <h3 className="font-semibold text-slate-900">Accessibility statement draft</h3>
          <p className="mt-2 whitespace-pre-line text-sm text-slate-600">{report.accessibilityStatementDraft}</p>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }) {
  const styles = {
    pass: 'bg-green-100 text-green-700',
    fail: 'bg-red-100 text-red-700',
    'not-tested': 'bg-slate-100 text-slate-500',
  }
  return (
    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || styles['not-tested']}`}>
      {status}
    </span>
  )
}

function ScanningState({ label }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-6 py-24 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      <p className="text-slate-600">{label}</p>
      <p className="text-sm text-slate-400">This usually takes 15–30 seconds.</p>
    </div>
  )
}
