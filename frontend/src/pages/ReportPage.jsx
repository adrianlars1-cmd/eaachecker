import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { ReportAPI } from '../lib/api'
import ScoreGauge from '../components/ScoreGauge'
import IssueCard from '../components/IssueCard'
import LockedSection from '../components/LockedSection'

const POLL_INTERVAL_MS = 2000
// Render's free tier can take 50s+ to wake a sleeping backend — retry
// transient/network errors for a while before concluding the report is
// genuinely missing, instead of failing on the very first failed request.
const MAX_WAKE_UP_MS = 75_000

export default function ReportPage() {
  const { id } = useParams()
  const [report, setReport] = useState(null)
  const [error, setError] = useState(null)
  const [wakingUp, setWakingUp] = useState(false)
  const [downloadingPdf, setDownloadingPdf] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    const startedAt = Date.now()

    async function poll() {
      try {
        const data = await ReportAPI.get(id)
        if (cancelled) return
        setWakingUp(false)
        setReport(data)
        if (data.status === 'pending' || data.status === 'running') {
          timerRef.current = setTimeout(poll, POLL_INTERVAL_MS)
        }
      } catch (err) {
        if (cancelled) return
        const isRealNotFound = err.response?.status === 404
        if (isRealNotFound || Date.now() - startedAt > MAX_WAKE_UP_MS) {
          setError(isRealNotFound ? 'Report not found.' : 'The server is taking too long to respond. Please try again shortly.')
          return
        }
        // Likely the backend is still waking up from being idle — keep retrying.
        setWakingUp(true)
        timerRef.current = setTimeout(poll, POLL_INTERVAL_MS)
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
    return (
      <ScanningState
        label={wakingUp ? 'Waking up the server…' : 'Loading report…'}
        sublabel={wakingUp ? "The free hosting tier goes to sleep when idle — this can take up to a minute the first time." : undefined}
      />
    )
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

  async function handleDownloadPdf() {
    setDownloadingPdf(true)
    try {
      const blob = await ReportAPI.downloadPdf(report.id)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `eaachecker-report-${report.id}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      alert('Could not download the PDF. Please try again shortly.')
    } finally {
      setDownloadingPdf(false)
    }
  }

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
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Full WCAG 2.1 AA report</h2>
            {report.fullReportUnlocked && report.aiFullReport && (
              <button
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {downloadingPdf ? 'Preparing PDF…' : 'Download PDF'}
              </button>
            )}
          </div>
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

function ScanningState({ label, sublabel }) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-6 py-24 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
      <p className="text-slate-600">{label}</p>
      <p className="text-sm text-slate-400">{sublabel || 'This usually takes 15–30 seconds.'}</p>
    </div>
  )
}
