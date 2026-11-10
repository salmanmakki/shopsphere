import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import AuthShell from '../components/layout/AuthShell'
import { Input } from '../components/ui/FormControls'
import { useAuth } from '../context/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

function LoginPage() {
  useDocumentTitle('Sign in')

  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from?.pathname || '/'

  const [form, setForm] = useState({ email: '', password: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      navigate(redirectTo === '/login' ? '/' : redirectTo, { replace: true })
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
      toast.success(`Welcome back, ${signedInUser.name.split(' ')[0]}.`)
      navigate(redirectTo === '/login' ? '/' : redirectTo, { replace: true })
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
      eyebrow="Welcome back"
      title="Sign in to ShopSphere"
      description="Access your cart, keep your details handy, and check out faster."
      footer={
        <p>
          New to ShopSphere?{' '}
          <Link
            to="/register"
            className="font-semibold text-ink underline decoration-line underline-offset-4 transition-colors hover:text-accent"
          >
            Create an account
          </Link>
        </p>
      }
    >
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
          label="Email address"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
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
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-muted">
        Administrator?{' '}
        <Link
          to="/admin/login"
          className="font-medium text-ink underline decoration-line underline-offset-4 transition-colors hover:text-accent"
        >
          Use the admin sign in
        </Link>
      </p>
    </AuthShell>
  )
}

export default LoginPage
