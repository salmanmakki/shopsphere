import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import Logo from '../ui/Logo'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useClickOutside } from '../../hooks/useClickOutside'
import { getCategories } from '../../services/productService'
import { cn } from '../../utils/cn'

const navLinkClass = ({ isActive }) =>
  cn(
    'text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors hover:text-ink',
    isActive ? 'text-ink' : 'text-muted',
  )

function Navbar() {
  const { user, logout } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()
  const location = useLocation()

  const [categories, setCategories] = useState([])
  const [activeMenu, setActiveMenu] = useState(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const menusRef = useRef(null)
  const lastScrollY = useRef(0)

  useClickOutside(
    menusRef,
    useCallback(() => setActiveMenu(null), []),
    Boolean(activeMenu),
  )

  useEffect(() => {
    const controller = new AbortController()

    getCategories({ signal: controller.signal })
      .then((response) => setCategories(response.data || []))
      .catch(() => {
        setCategories([])
      })

    return () => controller.abort()
  }, [])

  useEffect(() => {
    setActiveMenu(null)
    setMobileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setActiveMenu(null)
        setMobileOpen(false)
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > lastScrollY.current && window.scrollY > 120) {
        setMobileOpen(false)
      }
      lastScrollY.current = window.scrollY
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = async () => {
    setActiveMenu(null)
    setMobileOpen(false)
    await logout()
    toast.success('Signed out successfully.')
    navigate('/')
  }

  const initials = user?.name
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper">
      <div className="bg-ink text-paper">
        <div className="container-shop flex h-9 items-center justify-between text-[10px] font-medium uppercase tracking-[0.16em]">
          <span>Complimentary shipping on orders over $150</span>
          <span className="hidden sm:inline">Thoughtful goods, made to last</span>
        </div>
      </div>

      <div ref={menusRef} className="relative">
        <div className="container-shop flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <Logo />

            <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
              <NavLink to="/" end className={navLinkClass}>
                Home
              </NavLink>
              <NavLink to="/shop" className={navLinkClass}>
                Shop
              </NavLink>
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setActiveMenu((current) =>
                      current === 'categories' ? null : 'categories',
                    )
                  }
                  aria-expanded={activeMenu === 'categories'}
                  aria-haspopup="true"
                  className={cn(
                    'inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors hover:text-ink',
                    activeMenu === 'categories' ? 'text-ink' : 'text-muted',
                  )}
                >
                  Categories
                  <ChevronDown
                    className={cn(
                      'size-3 transition-transform',
                      activeMenu === 'categories' && 'rotate-180',
                    )}
                    aria-hidden="true"
                  />
                </button>
              </div>
              <NavLink to="/about" className={navLinkClass}>
                About
              </NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              type="button"
              onClick={() => navigate('/shop')}
              aria-label="Search products"
              className="flex size-10 items-center justify-center text-ink transition-colors hover:bg-surface"
            >
              <Search className="size-[18px]" aria-hidden="true" />
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setActiveMenu((current) =>
                    current === 'account' ? null : 'account',
                  )
                }
                aria-expanded={activeMenu === 'account'}
                aria-haspopup="true"
                aria-label="Account menu"
                className="flex size-10 items-center justify-center text-ink transition-colors hover:bg-surface"
              >
                {user ? (
                  <span className="flex size-7 items-center justify-center border border-ink text-[10px] font-bold">
                    {initials || <User className="size-3.5" />}
                  </span>
                ) : (
                  <User className="size-[18px]" aria-hidden="true" />
                )}
              </button>

              {activeMenu === 'account' && (
                <div className="absolute right-0 top-full z-50 mt-2 w-64 border border-line bg-paper p-2">
                  {user ? (
                    <>
                      <div className="border-b border-line px-3 py-3">
                        <p className="truncate text-sm font-semibold">{user.name}</p>
                        <p className="mt-0.5 truncate text-xs text-muted">
                          {user.email}
                        </p>
                        <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-accent">
                          {user.role}
                        </p>
                      </div>
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setActiveMenu(null)}
                          className="mt-1 flex items-center gap-2 px-3 py-2.5 text-sm transition-colors hover:bg-surface"
                        >
                          <LayoutDashboard className="size-4" aria-hidden="true" />
                          Admin dashboard
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-danger transition-colors hover:bg-surface"
                      >
                        <LogOut className="size-4" aria-hidden="true" />
                        Sign out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setActiveMenu(null)}
                        className="block px-3 py-2.5 text-sm font-medium transition-colors hover:bg-surface"
                      >
                        Sign in
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setActiveMenu(null)}
                        className="block px-3 py-2.5 text-sm transition-colors hover:bg-surface"
                      >
                        Create account
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            <Link
              to="/cart"
              aria-label={`Cart, ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
              className="relative flex size-10 items-center justify-center text-ink transition-colors hover:bg-surface"
            >
              <ShoppingBag className="size-[18px]" aria-hidden="true" />
              {itemCount > 0 && (
                <span className="absolute right-0 top-0 flex min-w-4 items-center justify-center bg-accent px-1 text-[9px] font-bold leading-4 text-paper">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              className="flex size-10 items-center justify-center text-ink transition-colors hover:bg-surface lg:hidden"
            >
              {mobileOpen ? (
                <X className="size-5" aria-hidden="true" />
              ) : (
                <Menu className="size-5" aria-hidden="true" />
              )}
            </button>

          </div>
        </div>

        {activeMenu === 'categories' && (
          <div className="absolute inset-x-0 top-full z-50 hidden border-y border-line bg-paper lg:block">
            <div className="container-shop py-6">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="eyebrow">Browse by category</p>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
                    Curated pieces for everyday rituals, organised so you can find
                    exactly what you need.
                  </p>
                </div>
                <Link
                  to="/shop"
                  onClick={() => setActiveMenu(null)}
                  className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.14em] underline decoration-line underline-offset-4 transition-colors hover:text-accent"
                >
                  Shop all products
                </Link>
              </div>

              {categories.length > 0 ? (
                <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-1 md:grid-cols-3 xl:grid-cols-4">
                  {categories.map((category) => (
                    <Link
                      key={category.name}
                      to={`/shop?category=${encodeURIComponent(category.name)}`}
                      onClick={() => setActiveMenu(null)}
                      className="group flex items-center justify-between gap-3 border-b border-line py-3 text-sm transition-colors hover:text-accent"
                    >
                      <span className="truncate">{category.name}</span>
                      <span className="text-[11px] tabular-nums text-muted">
                        {category.count}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="mt-6 text-sm text-muted">
                  Browse the full collection in the shop.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {mobileOpen && (
        <div className="border-t border-line bg-paper lg:hidden">
          <nav
            className="container-shop max-h-[calc(100vh-6.25rem)] overflow-y-auto py-4"
            aria-label="Mobile"
          >
            <div className="space-y-1">
              <Link
                to="/"
                className="block border-b border-line py-3 text-sm font-medium"
              >
                Home
              </Link>
              <Link
                to="/shop"
                className="block border-b border-line py-3 text-sm font-medium"
              >
                Shop all
              </Link>
              <Link
                to="/about"
                className="block border-b border-line py-3 text-sm font-medium"
              >
                About
              </Link>
              <Link
                to="/cart"
                className="block border-b border-line py-3 text-sm font-medium"
              >
                Cart ({itemCount})
              </Link>
            </div>

            <p className="eyebrow mt-6">Categories</p>
            <div className="mt-2 grid grid-cols-2 gap-x-4">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  to={`/shop?category=${encodeURIComponent(category.name)}`}
                  onClick={() => setMobileOpen(false)}
                  className="border-b border-line py-2.5 text-sm text-muted"
                >
                  {category.name}
                </Link>
              ))}
            </div>

            <div className="mt-6 border-t border-line pt-4">
              {user ? (
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{user.name}</p>
                    <p className="truncate text-xs text-muted">{user.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-xs font-semibold uppercase tracking-[0.12em] text-danger"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Link
                    to="/login"
                    className="flex h-10 flex-1 items-center justify-center border border-ink text-xs font-semibold uppercase tracking-[0.12em]"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="flex h-10 flex-1 items-center justify-center border border-line text-xs font-semibold uppercase tracking-[0.12em]"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

export default Navbar
