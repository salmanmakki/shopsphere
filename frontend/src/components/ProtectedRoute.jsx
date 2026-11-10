import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import { ShieldX } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import PageLoader from './ui/PageLoader'
import Logo from './ui/Logo'

function ProtectedRoute({ adminOnly = false }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-paper">
        <PageLoader label="Verifying access" />
      </div>
    )
  }

  if (!user) {
    return (
      <Navigate
        to={adminOnly ? '/admin/login' : '/login'}
        state={{ from: location }}
        replace
      />
    )
  }

  if (adminOnly && user.role !== 'admin') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center">
        <Logo className="mb-10" />
        <span className="flex size-14 items-center justify-center border border-line bg-surface">
          <ShieldX className="size-6 text-danger" aria-hidden="true" />
        </span>
        <h1 className="mt-6 font-display text-3xl font-extrabold tracking-tight">
          Administrator access only
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
          Your account does not have permission to view the admin dashboard.
          Sign in with an administrator account or return to the store.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="inline-flex h-11 items-center border border-ink bg-ink px-5 text-sm font-semibold text-paper transition-colors hover:border-accent hover:bg-accent"
          >
            Back to store
          </Link>
          <Link
            to="/admin/login"
            className="inline-flex h-11 items-center border border-line px-5 text-sm font-semibold transition-colors hover:border-ink"
          >
            Admin sign in
          </Link>
        </div>
      </div>
    )
  }

  return <Outlet />
}

export default ProtectedRoute
