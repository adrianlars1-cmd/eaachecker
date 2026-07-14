import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-slate-500 sm:flex-row">
        <Logo className="opacity-80" />
        <p>
          EAAChecker helps small and medium businesses check WCAG 2.1 AA &amp; EU
          Accessibility Act compliance. Reports are informational and are not a
          legal compliance guarantee.
        </p>
        <p>&copy; {new Date().getFullYear()} EAAChecker</p>
      </div>
    </footer>
  )
}
