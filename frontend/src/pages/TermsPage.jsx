import { Helmet } from 'react-helmet-async'

export default function TermsPage() {
  return (
    <>
      <Helmet>
        <title>Terms of Service — EAAChecker</title>
      </Helmet>
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold text-slate-900">Terms of Service</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long' })}</p>

        <div className="mt-8 flex flex-col gap-6 text-slate-700">
          <section>
            <h2 className="text-lg font-semibold text-slate-900">The service</h2>
            <p className="mt-2">
              EAAChecker runs an automated accessibility scan (axe-core and Lighthouse) against a
              URL you provide, and uses AI to summarize the results in plain language. Free scans
              are limited to a summary and top issues; a paid subscription unlocks the full report,
              PDF export, an accessibility statement draft, and automatic monthly re-scans.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Not a compliance guarantee</h2>
            <p className="mt-2">
              EAAChecker's reports are automated and informational. They are not a legal audit, and
              a good score is not a guarantee of compliance with the European Accessibility Act,
              WCAG, or any other law or standard. Estimated fine ranges shown in reports are rough
              heuristics, not legal or financial advice. You remain responsible for your own legal
              compliance.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Acceptable use</h2>
            <p className="mt-2">
              You may only scan URLs you own or have permission to scan. You may not use the service
              to probe, attack, or gather information about systems you do not have authorization to
              test.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Subscriptions and billing</h2>
            <p className="mt-2">
              Paid subscriptions are billed monthly via Stripe and can be cancelled at any time from
              your account page. Cancelling stops future billing; it does not retroactively refund
              the current billing period unless required by law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Contact</h2>
            <p className="mt-2">
              Questions about these terms? Email us at{' '}
              <a href="mailto:support@eaachecker.com" className="text-indigo-600 hover:underline">
                support@eaachecker.com
              </a>
              .
            </p>
          </section>

          <p className="text-xs text-slate-400">
            This is a general terms overview and not a substitute for formal legal advice.
          </p>
        </div>
      </div>
    </>
  )
}
