import { Helmet } from 'react-helmet-async'
import ScanForm from '../components/ScanForm'

const FEATURES = [
  {
    title: 'Free instant scan',
    desc: 'Paste any URL and get a WCAG 2.1 AA score, top 5 critical issues, and an estimated fine risk in under a minute.',
  },
  {
    title: 'Plain-language reports',
    desc: 'AI translates technical accessibility findings into clear explanations and concrete fixes — no jargon.',
  },
  {
    title: 'Stay compliant automatically',
    desc: 'Subscribers get the full 48-criteria report, a downloadable PDF, an accessibility statement draft, and automatic monthly re-scans with email alerts.',
  },
]

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>EAAChecker — Free WCAG &amp; EAA Compliance Scanner</title>
      </Helmet>
      <section className="bg-gradient-to-b from-indigo-50 to-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Is your website breaking EU accessibility law?
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            The European Accessibility Act requires WCAG 2.1 AA compliance for
            businesses across the EU/EEA. Find out where you stand — free, in
            under a minute.
          </p>
          <div className="mt-8">
            <ScanForm />
          </div>
          <p className="mt-3 text-xs text-slate-400">
            No credit card required. We'll never share your report without your permission.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-8 sm:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-900">{f.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center">
          <h2 className="text-2xl font-bold text-slate-900">Why it matters</h2>
          <p className="mt-3 text-slate-600">
            Regulators across the EU have found accessibility violations on the
            vast majority of sites they've audited. Fines can reach up to
            €200,000 per violation. A scan today tells you exactly where you
            stand — honestly, without a fake "instant fix" widget.
          </p>
        </div>
      </section>
    </>
  )
}
