import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScanAPI } from '../lib/api'

const LANGUAGES = [
  { code: 'sv', label: 'Svenska' },
  { code: 'da', label: 'Dansk' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'pl', label: 'Polski' },
  { code: 'it', label: 'Italiano' },
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
]

export default function ScanForm() {
  const [url, setUrl] = useState('')
  const [language, setLanguage] = useState('sv')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    let normalized = url.trim()
    if (normalized && !/^https?:\/\//i.test(normalized)) {
      normalized = `https://${normalized}`
    }
    try {
      // eslint-disable-next-line no-new
      new URL(normalized)
    } catch {
      setError('Please enter a valid website address.')
      return
    }

    setSubmitting(true)
    try {
      const { scanId } = await ScanAPI.create(normalized, language)
      sessionStorage.setItem('eaachecker_last_scan', scanId)
      navigate(`/report/${scanId}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong starting the scan. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-2xl flex-col gap-3 sm:flex-row">
      <label htmlFor="url" className="sr-only">
        Website URL
      </label>
      <input
        id="url"
        type="text"
        inputMode="url"
        placeholder="yourcompany.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        required
        className="flex-1 rounded-lg border border-slate-300 px-4 py-3 text-base shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
      />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        aria-label="Report language"
        className="rounded-lg border border-slate-300 bg-white px-3 py-3 text-base shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.label}
          </option>
        ))}
      </select>
      <button
        type="submit"
        disabled={submitting}
        className="whitespace-nowrap rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? 'Starting scan…' : 'Scan for free'}
      </button>
      {error && <p className="text-sm text-red-600 sm:absolute">{error}</p>}
    </form>
  )
}
