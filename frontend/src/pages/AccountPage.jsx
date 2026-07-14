import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { BillingAPI } from '../lib/api'

export default function AccountPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const subscription = user?.subscription

  async function handleManageBilling() {
    setError(null)
    setLoading(true)
    try {
      const { url } = await BillingAPI.portalSession()
      window.location.href = url
    } catch {
      setError('Could not open billing portal. Please try again shortly.')
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-bold text-slate-900">Account</h1>
      <p className="mt-1 text-slate-600">{user?.email}</p>

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="font-semibold text-slate-900">Subscription</h2>
        {subscription ? (
          <>
            <p className="mt-2 text-sm text-slate-600">
              Status: <span className="font-medium text-slate-900">{subscription.status}</span>
            </p>
            <p className="text-sm text-slate-600">
              Renews: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
            </p>
          </>
        ) : (
          <p className="mt-2 text-sm text-slate-600">You're on the free plan.</p>
        )}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button
          onClick={handleManageBilling}
          disabled={loading}
          className="mt-4 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
        >
          {loading ? 'Opening…' : subscription ? 'Manage billing' : 'View plans'}
        </button>
      </div>
    </div>
  )
}
