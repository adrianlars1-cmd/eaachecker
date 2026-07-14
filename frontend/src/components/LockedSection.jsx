import { Link } from 'react-router-dom'

export default function LockedSection({ children, title = 'Full report locked' }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200">
      <div className="pointer-events-none select-none blur-sm" aria-hidden="true">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/70 p-6 text-center backdrop-blur-[2px]">
        <p className="text-lg font-semibold text-slate-900">{title}</p>
        <p className="max-w-sm text-sm text-slate-600">
          Subscribe to unlock all 48 WCAG 2.1 AA criteria, a downloadable PDF, an
          accessibility statement draft, and automatic monthly re-scans.
        </p>
        <Link
          to="/pricing"
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
        >
          Unlock full report
        </Link>
      </div>
    </div>
  )
}
