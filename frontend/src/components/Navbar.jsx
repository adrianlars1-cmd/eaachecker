import { Link, useNavigate } from 'react-router-dom'
import Logo from './Logo'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-20">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" aria-label="EAAChecker home">
          <Logo />
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link to="/pricing" className="hover:text-slate-900">Pricing</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="hover:text-slate-900">Dashboard</Link>
              <Link to="/account" className="hover:text-slate-900">Account</Link>
              <button
                onClick={() => {
                  logout()
                  navigate('/')
                }}
                className="rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-700"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-slate-900">Log in</Link>
              <Link to="/signup" className="rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500">
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
