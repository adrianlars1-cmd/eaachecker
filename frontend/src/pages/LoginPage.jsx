import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ScanAPI } from '../lib/api'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email, password)
      await claimPendingScan()
      navigate(location.state?.from || '/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <h1 className="text-2xl font-bold text-slate-900">Log in</h1>
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <Field label="Email" type="email" value={email} onChange={setEmail} />
        <Field label="Password" type="password" value={password} onChange={setPassword} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
        >
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-500">
        No account? <Link to="/signup" className="text-indigo-600 hover:underline">Sign up</Link>
      </p>
    </div>
  )
}

async function claimPendingScan() {
  const scanId = sessionStorage.getItem('eaachecker_last_scan')
  if (!scanId) return
  try {
    await ScanAPI.claim(scanId)
  } finally {
    sessionStorage.removeItem('eaachecker_last_scan')
  }
}

function Field({ label, type, value, onChange }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
      {label}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="rounded-lg border border-slate-300 px-3 py-2 text-base shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
      />
    </label>
  )
}

export { Field, claimPendingScan }
