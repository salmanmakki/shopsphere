import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  LayoutDashboard,
  Layers,
  LogOut,
  Menu,
  Package,
  Plus,
  Store,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Logo from '../ui/Logo'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../utils/cn'

const CURRENT_DATE = new Date().toLocaleDateString(undefined, {
  weekday: 'long',
  month: 'short',
  day: 'numeric',
})

const navItems = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package, end: true },
  { to: '/admin/products/new', label: 'Add product', icon: Plus, end: true },
  { to: '/admin/categories', label: 'Categories', icon: Layers, end: true },
]

const getPageTitle = (pathname) => {
  if (pathname === '/admin') return 'Overview'
  if (pathname === '/admin/products/new') return 'Add product'
  if (/^\/admin\/products\/[^/]+\/edit$/.test(pathname)) return 'Edit product'
  if (pathname === '/admin/products') return 'Products'
  if (pathname === '/admin/categories') return 'Categories'
  return 'Dashboard'
}

function SidebarLink({ item, onNavigate }) {
  const Icon = item.icon

  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2.5 text-sm transition-colors',
          isActive
            ? 'bg-ink font-semibold text-paper'
            : 'text-muted hover:bg-surface hover:text-ink',
        )
      }
    >
      <Icon className="size-4" aria-hidden="true" />
      {item.label}
    </NavLink>
  )
}

function SidebarContent({ onNavigate }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    onNavigate?.()
    await logout()
    toast.success('Signed out of the admin area.')
    navigate('/admin/login')
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-line px-6 py-6">
        <Logo />
        <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
          Administration
        </p>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Admin">
        <p className="px-3 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted/70">
          Workspace
        </p>
        {navItems.map((item) => (
          <SidebarLink key={item.to} item={item} onNavigate={onNavigate} />
        ))}

        <div className="my-4 border-t border-line" />

        <Link
          to="/"
          onClick={onNavigate}
          className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted transition-colors hover:bg-surface hover:text-ink"
        >
          <Store className="size-4" aria-hidden="true" />
          View storefront
        </Link>
      </nav>

      <div className="border-t border-line p-4">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center border border-line bg-surface text-xs font-bold">
            {user?.name?.charAt(0)?.toUpperCase() || 'A'}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{user?.name}</p>
            <p className="truncate text-[11px] text-muted">{user?.email}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Sign out"
            className="flex size-8 shrink-0 items-center justify-center text-muted transition-colors hover:text-danger"
          >
            <LogOut className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )
}

function AdminLayout() {
  const { user } = useAuth()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const pageTitle = getPageTitle(location.pathname)

  useEffect(() => {
    setMobileOpen(false)
    setNotificationsOpen(false)
  }, [location.pathname])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMobileOpen(false)
        setNotificationsOpen(false)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className="min-h-screen bg-surface/60">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line bg-paper lg:block">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-ink/50"
          />
          <div className="relative h-full w-72 border-r border-line bg-paper">
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation"
              className="absolute right-3 top-3 flex size-8 items-center justify-center text-muted"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-line bg-paper px-5 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation"
              className="flex size-9 items-center justify-center border border-line transition-colors hover:border-ink lg:hidden"
            >
              <Menu className="size-4" aria-hidden="true" />
            </button>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
                Admin / {pageTitle}
              </p>
              <h1 className="truncate font-display text-lg font-bold tracking-tight">
                {pageTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-[11px] text-muted xl:block">
              {CURRENT_DATE}
            </span>

            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen((open) => !open)}
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
                className="relative flex size-9 items-center justify-center border border-line bg-paper transition-colors hover:border-ink"
              >
                <Bell className="size-4" aria-hidden="true" />
                <span className="absolute right-2 top-2 size-1.5 bg-accent" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-72 border border-line bg-paper p-4">
                  <div className="flex items-center justify-between border-b border-line pb-3">
                    <p className="text-sm font-semibold">Notifications</p>
                    <button
                      type="button"
                      onClick={() => setNotificationsOpen(false)}
                      aria-label="Close notifications"
                      className="text-muted transition-colors hover:text-ink"
                    >
                      <X className="size-3.5" aria-hidden="true" />
                    </button>
                  </div>
                  <p className="pt-3 text-xs leading-relaxed text-muted">
                    You are all caught up. Low-stock and order alerts will appear
                    here.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 border-l border-line pl-3">
              <span className="flex size-8 items-center justify-center border border-line bg-surface text-[10px] font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </span>
              <div className="hidden sm:block">
                <p className="max-w-32 truncate text-xs font-semibold">
                  {user?.name}
                </p>
                <p className="text-[10px] uppercase tracking-[0.12em] text-muted">
                  {user?.role}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
