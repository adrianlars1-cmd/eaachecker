import { Link } from 'react-router-dom'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-8 text-sm text-slate-500">
        <Logo className="opacity-80" />
        <p className="max-w-2xl text-center">
          EAAChecker helps small and medium businesses check WCAG 2.1 AA &amp; EU
          Accessibility Act compliance. Reports are automated and informational —
          they are not a legal audit or a compliance guarantee.
        </p>
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          <Link to="/privacy" className="hover:text-slate-700">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-slate-700">Terms of Service</Link>
          <a href="mailto:support@eaachecker.com" className="hover:text-slate-700">support@eaachecker.com</a>
        </nav>
        <p>&copy; {new Date().getFullYear()} EAAChecker</p>
      </div>
    </footer>
  )
}
