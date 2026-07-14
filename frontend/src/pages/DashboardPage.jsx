import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ScanAPI } from '../lib/api'
import ScanForm from '../components/ScanForm'

const STATUS_STYLES = {
  completed: 'bg-green-100 text-green-700',
  running: 'bg-amber-100 text-amber-700',
  pending: 'bg-amber-100 text-amber-700',
  failed: 'bg-red-100 text-red-700',
}

export default function DashboardPage() {
  const [scans, setScans] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    ScanAPI.myScans()
      .then((data) => setScans(data.scans))
      .catch(() => setError('Could not load your scans.'))
  }, [])

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-2xl font-bold text-slate-900">Your scans</h1>
      <div className="mt-6">
        <ScanForm />
      </div>

      <div className="mt-10">
        {error && <p className="text-red-600">{error}</p>}
        {scans === null && !error && <p className="text-slate-500">Loading…</p>}
        {scans?.length === 0 && <p className="text-slate-500">No scans yet — paste a URL above to get started.</p>}
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
          {scans?.map((scan) => (
            <li key={scan.id}>
              <Link to={`/report/${scan.id}`} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-slate-50">
                <div>
                  <p className="font-medium text-slate-900">{scan.url}</p>
                  <p className="text-xs text-slate-400">{new Date(scan.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  {scan.score != null && <span className="text-sm font-semibold text-slate-700">{scan.score}/100</span>}
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[scan.status] || ''}`}>
                    {scan.status}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
