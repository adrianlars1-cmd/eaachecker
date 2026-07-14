import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { BillingAPI } from '../lib/api'

const FEATURES = [
  'Full report covering all 48 WCAG 2.1 AA success criteria',
  'Downloadable PDF report',
  'Auto-generated accessibility statement draft',
  'Automatic monthly re-scans',
  'Email alerts when new issues appear',
  'Scan history for every site you track',
]

export default function PricingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubscribe() {
    if (!user) {
      navigate('/signup')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const { url } = await BillingAPI.checkoutSession()
      window.location.href = url
    } catch {
      setError('Could not start checkout. Please try again shortly.')
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 text-center">
      <h1 className="text-3xl font-bold text-slate-900">Simple, monthly pricing</h1>
      <p className="mt-2 text-slate-600">One plan. Cancel anytime.</p>

      <div className="mx-auto mt-10 max-w-md rounded-2xl border border-indigo-200 bg-white p-8 text-left shadow-sm">
        <p className="text-sm font-semibold text-indigo-600">EAAChecker Pro</p>
        <p className="mt-2 text-4xl font-bold text-slate-900">
          €39<span className="text-base font-medium text-slate-400">/month</span>
        </p>
        <ul className="mt-6 flex flex-col gap-3">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
              <span className="mt-0.5 text-green-600">✓</span>
              {f}
            </li>
          ))}
        </ul>
        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="mt-8 w-full rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
        >
          {loading ? 'Redirecting…' : 'Subscribe now'}
        </button>
      </div>
    </div>
  )
}
