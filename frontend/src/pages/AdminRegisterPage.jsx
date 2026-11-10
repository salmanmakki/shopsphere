import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import AuthShell from '../components/layout/AuthShell'
import { Input } from '../components/ui/FormControls'
import { useAuth } from '../context/AuthContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

function AdminRegisterPage() {
  useDocumentTitle('Create admin account')

  const { user, registerAdmin } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin', { replace: true })
    }
  }, [user, navigate])

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
    const name = form.name.trim()
    const email = form.email.trim()

    if (name.length < 2) {
      nextErrors.name = 'Enter your name (at least 2 characters).'
    }
    if (name.length > 80) {
      nextErrors.name = 'Name must be 80 characters or fewer.'
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = 'Enter a valid email address.'
    }
    if (form.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.'
    }
    if (form.password.length > 72) {
      nextErrors.password = 'Password must be 72 characters or fewer.'
    }
    if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = 'Passwords do not match.'
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors)
      return
    }

    setLoading(true)
    setError('')

    try {
      const createdUser = await registerAdmin({
        name,
        email,
        password: form.password,
      })
      toast.success(`Administrator account created for ${createdUser.name}.`)
      navigate('/admin', { replace: true })
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
      title="Create an administrator account"
      description="Set up a new account with full access to the catalogue, inventory, and dashboard."
      footer={
        <div className="space-y-2">
          <p>
            Already an administrator?{' '}
            <Link
              to="/admin/login"
              className="font-semibold text-ink underline decoration-line underline-offset-4 transition-colors hover:text-accent"
            >
              Sign in
            </Link>
          </p>
          <p>
            Customer?{' '}
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
        <ShieldCheck
          className="mt-0.5 size-4 shrink-0 text-accent"
          aria-hidden="true"
        />
        <p className="text-xs leading-relaxed text-muted">
          New accounts receive full administrator access. Only create accounts
          for trusted administrators.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger"
          >
            <AlertCircle
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            {error}
          </div>
        )}

        <Input
          label="Full name"
          required
          autoComplete="name"
          placeholder="Alex Morgan"
          value={form.name}
          onChange={updateField('name')}
          error={fieldErrors.name}
        />

        <Input
          label="Admin email"
          type="email"
          required
          autoComplete="email"
          placeholder="admin@example.com"
          value={form.email}
          onChange={updateField('email')}
          error={fieldErrors.email}
        />

        <Input
          label="Password"
          type="password"
          required
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={form.password}
          onChange={updateField('password')}
          error={fieldErrors.password}
          hint="Use 8–72 characters. A passphrase works well."
        />

        <Input
          label="Confirm password"
          type="password"
          required
          autoComplete="new-password"
          placeholder="Repeat your password"
          value={form.confirmPassword}
          onChange={updateField('confirmPassword')}
          error={fieldErrors.confirmPassword}
        />

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 w-full items-center justify-center border border-ink bg-ink text-sm font-semibold text-paper transition-colors hover:border-accent hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Creating administrator…' : 'Create admin account'}
        </button>
      </form>
    </AuthShell>
  )
}

export default AdminRegisterPage
