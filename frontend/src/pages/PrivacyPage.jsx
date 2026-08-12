import { Helmet } from 'react-helmet-async'

export default function PrivacyPage() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy — EAAChecker</title>
      </Helmet>
      <div className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: {new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long' })}</p>

        <div className="mt-8 flex flex-col gap-6 text-slate-700">
          <section>
            <h2 className="text-lg font-semibold text-slate-900">What we collect</h2>
            <p className="mt-2">
              When you run a scan, we store the URL you submit and the results of that scan
              (accessibility score, issues found, and the AI-generated summary). If you create an
              account, we store your email address and a securely hashed password — we never store
              your password in plain text. If you subscribe, billing is handled entirely by Stripe;
              we store your subscription status but never your card details.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">How we use it</h2>
            <p className="mt-2">
              Scan data is used to generate and display your report, and — for paying subscribers —
              to run automatic monthly re-scans and email alerts. We do not sell your data to third
              parties. Anonymized, aggregate scan statistics may be used for product improvement or
              public research reports.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Third-party services</h2>
            <p className="mt-2">
              We use Anthropic (Claude) to generate report summaries from scan data, Stripe for
              payment processing, and SendGrid for transactional email. Each of these providers
              processes data under their own privacy terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Public report links</h2>
            <p className="mt-2">
              Free scan reports are accessible via a shareable link. Anyone with the link can view
              the free summary of that report. Do not share a report link if you consider the scan
              results confidential.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-900">Your rights</h2>
            <p className="mt-2">
              You can request deletion of your account and associated data at any time by contacting
              us at{' '}
              <a href="mailto:support@eaachecker.com" className="text-indigo-600 hover:underline">
                support@eaachecker.com
              </a>
              .
            </p>
          </section>

          <p className="text-xs text-slate-400">
            This is a general privacy overview and not a substitute for formal legal advice. If you
            require a legally reviewed privacy policy for your jurisdiction, please consult a
            qualified professional.
          </p>
        </div>
      </div>
    </>
  )
}
