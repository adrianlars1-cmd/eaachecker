import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Field, claimPendingScan } from './LoginPage'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await register(email, password)
      await claimPendingScan()
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Could not create account. That email may already be registered.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <Field label="Email" type="email" value={email} onChange={setEmail} />
        <Field label="Password" type="password" value={password} onChange={setPassword} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-500 disabled:opacity-60"
        >
          {submitting ? 'Creating account…' : 'Sign up'}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-500">
        Already have an account? <Link to="/login" className="text-indigo-600 hover:underline">Log in</Link>
      </p>
    </div>
  )
}
