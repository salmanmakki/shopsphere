import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import AuthShell from '../components/layout/AuthShell'
import { Input } from '../components/ui/FormControls'
import { useAuth } from '../context/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

const allowAdminRegistration =
  import.meta.env.VITE_ALLOW_ADMIN_REGISTRATION !== 'false'

function AdminLoginPage() {
  useDocumentTitle('Admin sign in')

  const { user, login, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const requestedPath = location.state?.from?.pathname
  const redirectTo =
    requestedPath && requestedPath.startsWith('/admin') ? requestedPath : '/admin'

  const [form, setForm] = useState({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user?.role === 'admin') {
      navigate(redirectTo, { replace: true })
    }
  }, [user, navigate, redirectTo])

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
    if (fieldErrors[field]) {
      setFieldErrors((current) => ({ ...current, [field]: '' }))
    }
    if (error) setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const nextErrors = {}
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = 'Enter a valid email address.'
    }
    if (!form.password) {
      nextErrors.password = 'Enter your password.'
    }
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors)
      return
    }

    setLoading(true)
    setError('')

    try {
      const signedInUser = await login({
        email: form.email.trim(),
        password: form.password,
      })

      if (signedInUser.role !== 'admin') {
        await logout()
        setError('This account does not have administrator access.')
        return
      }

      toast.success('Welcome to the admin dashboard.')
      navigate(redirectTo, { replace: true })
    } catch (requestError) {
      if (Array.isArray(requestError.errors) && requestError.errors.length) {
        setFieldErrors((current) => {
          const next = { ...current }
          requestError.errors.forEach((item) => {
            if (item.field) next[item.field] = item.message
          })
          return next
        })
      }
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Administration"
      title="Sign in to the dashboard"
      description="Manage the catalogue, monitor stock, and keep the storefront current."
      footer={
        <div className="space-y-2">
          {allowAdminRegistration && (
            <p>
              Need an administrator account?{' '}
              <Link
                to="/admin/register"
                className="font-semibold text-ink underline decoration-line underline-offset-4 transition-colors hover:text-accent"
              >
                Create one
              </Link>
            </p>
          )}
          <p>
            Not an administrator?{' '}
            <Link
              to="/login"
              className="font-semibold text-ink underline decoration-line underline-offset-4 transition-colors hover:text-accent"
            >
              Customer sign in
            </Link>
          </p>
        </div>
      }
    >
      <div className="mb-6 flex items-start gap-3 border border-line bg-surface/60 px-4 py-3">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
        <p className="text-xs leading-relaxed text-muted">
          {allowAdminRegistration
            ? 'Administrator accounts can be created from the registration page, or provisioned with the seed script.'
            : 'Administrator accounts are provisioned with the admin seed script.'}{' '}
          Customer accounts cannot access this area.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {error}
          </div>
        )}

        <Input
          label="Admin email"
          type="email"
          required
          autoComplete="email"
          placeholder="admin@shopsphere.com"
          value={form.email}
          onChange={updateField('email')}
          error={fieldErrors.email}
        />

        <Input
          label="Password"
          type="password"
          required
          autoComplete="current-password"
          placeholder="Your password"
          value={form.password}
          onChange={updateField('password')}
          error={fieldErrors.password}
        />

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 w-full items-center justify-center border border-ink bg-ink text-sm font-semibold text-paper transition-colors hover:border-accent hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Verifying access…' : 'Enter dashboard'}
        </button>
      </form>
    </AuthShell>
  )
}

export default AdminLoginPage
