import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import Logo from '../ui/Logo'

const CURRENT_YEAR = new Date().getFullYear()

const shopLinks = [
  { label: 'All products', to: '/shop' },
  { label: 'New arrivals', to: '/shop?sort=newest' },
  { label: 'Best sellers', to: '/shop?bestSeller=true' },
]

const categoryLinks = [
  'Apparel',
  'Accessories',
  'Home',
  'Footwear',
]

const helpLinks = [
  { label: 'About ShopSphere', to: '/about' },
  { label: 'Your cart', to: '/cart' },
  { label: 'Sign in', to: '/login' },
  { label: 'Create account', to: '/register' },
]

function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.error('Enter a valid email address.')
      return
    }

    setSubscribed(true)
    setEmail('')
    toast.success('You are on the list. Welcome to ShopSphere.')
  }

  return (
    <footer className="mt-20 bg-ink text-paper">
      <div className="container-shop py-14 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:gap-10">
          <div>
            <Logo light />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-paper/60">
              A considered edit of goods for the modern home and everyday
              wardrobe. Designed to be used, kept, and loved.
            </p>
            <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.16em] text-paper/40">
              Thoughtful goods, made to last
            </p>
          </div>

          <div>
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-paper/40">
              Shop
            </h2>
            <ul className="mt-4 space-y-2.5">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-paper/75 transition-colors hover:text-paper"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-paper/40">
              Collections
            </h2>
            <ul className="mt-4 space-y-2.5">
              {categoryLinks.map((category) => (
                <li key={category}>
                  <Link
                    to={`/shop?category=${encodeURIComponent(category)}`}
                    className="text-sm text-paper/75 transition-colors hover:text-paper"
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-paper/40">
              The list
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-paper/60">
              New arrivals, studio notes, and considered offers. No noise.
            </p>
            <form onSubmit={handleSubmit} className="mt-5">
              <div className="flex border-b border-paper/30 focus-within:border-paper">
                <label htmlFor="footer-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="footer-email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    if (subscribed) setSubscribed(false)
                  }}
                  placeholder="Email address"
                  className="h-11 min-w-0 flex-1 bg-transparent text-sm text-paper placeholder:text-paper/35 focus:outline-none"
                />
                <button
                  type="submit"
                  aria-label="Subscribe to the newsletter"
                  className="flex size-11 items-center justify-center text-paper transition-colors hover:text-paper/60"
                >
                  <ArrowRight className="size-4" aria-hidden="true" />
                </button>
              </div>
              <p
                className="mt-3 text-[11px] text-paper/40"
                aria-live="polite"
              >
                {subscribed
                  ? 'Subscribed — thank you.'
                  : 'By subscribing you agree to our privacy policy.'}
              </p>
            </form>

            <ul className="mt-6 space-y-2.5">
              {helpLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-xs text-paper/55 transition-colors hover:text-paper"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-paper/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-paper/40">
            © {CURRENT_YEAR} ShopSphere. All rights reserved.
          </p>
          <div className="flex items-center gap-5 text-[10px] font-semibold uppercase tracking-[0.14em] text-paper/40">
            <span>Secure checkout</span>
            <span>Shipping worldwide</span>
            <span>Easy returns</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
