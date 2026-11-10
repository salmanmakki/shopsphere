import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Lock,
  PackageCheck,
  ShoppingBag,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { Input, Select } from '../components/ui/FormControls'
import EmptyState from '../components/ui/EmptyState'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { formatCurrency } from '../utils/format'
import {
  FREE_SHIPPING_THRESHOLD,
  PLACEHOLDER_IMAGE,
  STANDARD_SHIPPING,
} from '../utils/constants'
import { cn } from '../utils/cn'

const initialForm = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  postalCode: '',
  country: 'United States',
  payment: 'card',
}

const validate = (form) => {
  const errors = {}

  if (form.fullName.trim().length < 2) {
    errors.fullName = 'Enter your full name.'
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Enter a valid email address.'
  }
  if (form.address.trim().length < 5) {
    errors.address = 'Enter your street address.'
  }
  if (!form.city.trim()) {
    errors.city = 'Enter your city.'
  }
  if (!form.postalCode.trim()) {
    errors.postalCode = 'Enter your postal code.'
  }
  if (!form.country.trim()) {
    errors.country = 'Select a country.'
  }

  return errors
}

function CheckoutPage() {
  useDocumentTitle('Checkout')

  const { user } = useAuth()
  const { items, subtotal, removeAll } = useCart()

  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [placing, setPlacing] = useState(false)
  const [order, setOrder] = useState(null)

  useEffect(() => {
    if (!user) return
    setForm((current) => ({
      ...current,
      fullName: current.fullName || user.name || '',
      email: current.email || user.email || '',
    }))
  }, [user])

  const shipping =
    subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD
      ? 0
      : STANDARD_SHIPPING
  const total = subtotal + shipping

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }))
    if (errors[field]) {
      setErrors((current) => ({ ...current, [field]: '' }))
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const nextErrors = validate(form)
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      toast.error('Please check the highlighted fields.')
      return
    }

    setPlacing(true)

    const orderNumber = `SS-${String(Date.now()).slice(-8)}`
    const snapshot = {
      number: orderNumber,
      items,
      subtotal,
      shipping,
      total,
      customer: { ...form },
      placedAt: new Date().toISOString(),
    }

    await new Promise((resolve) => {
      setTimeout(resolve, 650)
    })

    setOrder(snapshot)
    removeAll()
    setPlacing(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (order) {
    return (
      <div className="container-shop py-12 lg:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="border border-line bg-paper p-6 sm:p-10">
            <span className="flex size-14 items-center justify-center border border-success/30 bg-success/5">
              <PackageCheck className="size-6 text-success" aria-hidden="true" />
            </span>
            <p className="eyebrow mt-6">Order received</p>
            <h1 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">
              Thank you, {order.customer.fullName.split(' ')[0]}.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
              Your order <span className="font-semibold text-ink">{order.number}</span>{' '}
              has been recorded. A confirmation would normally be sent to{' '}
              <span className="font-medium text-ink">{order.customer.email}</span>.
            </p>

            <div className="mt-6 border border-line bg-surface/60 px-4 py-3 text-xs leading-relaxed text-muted">
              This portfolio demo does not process payments, send email, or
              dispatch orders. Placing an order simply demonstrates the checkout
              experience end to end.
            </div>

            <div className="mt-8 grid gap-8 border-t border-line pt-6 sm:grid-cols-2">
              <div>
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em]">
                  Shipping to
                </h2>
                <address className="mt-3 text-sm not-italic leading-relaxed text-muted">
                  {order.customer.fullName}
                  <br />
                  {order.customer.address}
                  <br />
                  {order.customer.city}, {order.customer.postalCode}
                  <br />
                  {order.customer.country}
                  {order.customer.phone && (
                    <>
                      <br />
                      {order.customer.phone}
                    </>
                  )}
                </address>
              </div>
              <div>
                <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em]">
                  Summary
                </h2>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">Subtotal</dt>
                    <dd>{formatCurrency(order.subtotal)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted">Shipping</dt>
                    <dd>
                      {order.shipping === 0
                        ? 'Free'
                        : formatCurrency(order.shipping)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 border-t border-line pt-2 font-semibold">
                    <dt>Total</dt>
                    <dd>{formatCurrency(order.total)}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="mt-8 border-t border-line pt-6">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em]">
                Items
              </h2>
              <ul className="mt-3 divide-y divide-line">
                {order.items.map((item) => (
                  <li
                    key={item.productId}
                    className="flex items-center justify-between gap-4 py-3 text-sm"
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-medium">
                        {item.name}
                      </span>
                      <span className="text-xs text-muted">
                        Qty {item.quantity}
                      </span>
                    </span>
                    <span className="shrink-0 font-medium">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <Link
              to="/shop"
              className="inline-flex h-11 items-center gap-2 border border-ink bg-ink px-6 text-sm font-semibold text-paper transition-colors hover:border-accent hover:bg-accent"
            >
              Continue shopping
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container-shop py-16 lg:py-24">
        <EmptyState
          icon={ShoppingBag}
          title="Nothing to check out"
          description="Your cart is empty. Add something from the collection before checking out."
        >
          <Link
            to="/shop"
            className="inline-flex h-11 items-center gap-2 border border-ink bg-ink px-5 text-sm font-semibold text-paper transition-colors hover:border-accent hover:bg-accent"
          >
            Browse products
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </EmptyState>
      </div>
    )
  }

  return (
    <div>
      <div className="border-b border-line">
        <div className="container-shop py-4">
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted transition-colors hover:text-ink"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Back to cart
          </Link>
        </div>
      </div>

      <div className="container-shop py-10 lg:py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Secure checkout</p>
            <h1 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">
              Complete your order
            </h1>
          </div>
          <p className="inline-flex items-center gap-1.5 text-[11px] text-muted">
            <Lock className="size-3.5" aria-hidden="true" />
            Encrypted and private
          </p>
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px] lg:gap-14">
          <form onSubmit={handleSubmit} noValidate className="space-y-10">
            <section>
              <div className="flex items-baseline gap-3 border-b border-line pb-3">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
                  01
                </span>
                <h2 className="text-sm font-semibold">Contact</h2>
              </div>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <Input
                  label="Full name"
                  required
                  autoComplete="name"
                  value={form.fullName}
                  onChange={updateField('fullName')}
                  error={errors.fullName}
                  placeholder="Alex Morgan"
                />
                <Input
                  label="Email"
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={updateField('email')}
                  error={errors.email}
                  placeholder="alex@example.com"
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Phone (optional)"
                    type="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={updateField('phone')}
                    placeholder="+1 (555) 000-0000"
                    hint="Used only for delivery updates."
                  />
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-baseline gap-3 border-b border-line pb-3">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
                  02
                </span>
                <h2 className="text-sm font-semibold">Shipping address</h2>
              </div>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Input
                    label="Street address"
                    required
                    autoComplete="street-address"
                    value={form.address}
                    onChange={updateField('address')}
                    error={errors.address}
                    placeholder="123 Studio Lane, Apt 4"
                  />
                </div>
                <Input
                  label="City"
                  required
                  autoComplete="address-level2"
                  value={form.city}
                  onChange={updateField('city')}
                  error={errors.city}
                  placeholder="Portland"
                />
                <Input
                  label="Postal code"
                  required
                  autoComplete="postal-code"
                  value={form.postalCode}
                  onChange={updateField('postalCode')}
                  error={errors.postalCode}
                  placeholder="97205"
                />
                <div className="sm:col-span-2">
                  <Select
                    label="Country"
                    required
                    autoComplete="country-name"
                    value={form.country}
                    onChange={updateField('country')}
                    error={errors.country}
                  >
                    <option>United States</option>
                    <option>Canada</option>
                    <option>United Kingdom</option>
                    <option>Australia</option>
                    <option>Germany</option>
                    <option>France</option>
                    <option>Netherlands</option>
                    <option>Japan</option>
                  </Select>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-baseline gap-3 border-b border-line pb-3">
                <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-accent">
                  03
                </span>
                <h2 className="text-sm font-semibold">Payment</h2>
              </div>

              <div className="mt-5 space-y-3">
                {[
                  {
                    value: 'card',
                    title: 'Card (demo)',
                    description:
                      'No card details are collected or stored in this demo.',
                  },
                  {
                    value: 'cod',
                    title: 'Pay on delivery',
                    description: 'Pay in cash when your order arrives.',
                  },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      'flex cursor-pointer items-start gap-3 border p-4 transition-colors',
                      form.payment === option.value
                        ? 'border-ink'
                        : 'border-line hover:border-muted',
                    )}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={option.value}
                      checked={form.payment === option.value}
                      onChange={updateField('payment')}
                      className="sr-only"
                    />
                    <span
                      className={cn(
                        'mt-0.5 flex size-4 shrink-0 items-center justify-center border',
                        form.payment === option.value
                          ? 'border-ink bg-ink text-paper'
                          : 'border-line',
                      )}
                      aria-hidden="true"
                    >
                      {form.payment === option.value && (
                        <Check className="size-3" />
                      )}
                    </span>
                    <span>
                      <span className="block text-sm font-medium">
                        {option.title}
                      </span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-muted">
                        {option.description}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </section>

            <div className="border-t border-line pt-6">
              <button
                type="submit"
                disabled={placing}
                className="inline-flex h-12 w-full items-center justify-center gap-2 border border-ink bg-ink px-6 text-sm font-semibold text-paper transition-colors hover:border-accent hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-64"
              >
                {placing ? 'Placing order…' : 'Place order'}
                {!placing && <ArrowRight className="size-4" aria-hidden="true" />}
              </button>
              <p className="mt-3 text-[11px] leading-relaxed text-muted">
                By placing this order you agree to the demo terms. No payment
                will be taken and no data is stored beyond your browser.
              </p>
            </div>
          </form>

          <aside>
            <div className="sticky top-24 border border-line bg-surface/50 p-6">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em]">
                Order summary
              </h2>

              <ul className="mt-5 max-h-80 space-y-4 overflow-y-auto border-b border-line pb-5">
                {items.map((item) => (
                  <li key={item.productId} className="flex gap-3">
                    <div className="size-16 shrink-0 border border-line bg-paper">
                      <img
                        src={item.image || PLACEHOLDER_IMAGE}
                        alt={item.name}
                        onError={(event) => {
                          event.currentTarget.src = PLACEHOLDER_IMAGE
                        }}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <p className="mt-1 text-xs text-muted">
                        Qty {item.quantity} · {formatCurrency(item.price)}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-medium">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </li>
                ))}
              </ul>

              <dl className="space-y-3 py-5 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Subtotal</dt>
                  <dd>{formatCurrency(subtotal)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Shipping</dt>
                  <dd>{shipping === 0 ? 'Free' : formatCurrency(shipping)}</dd>
                </div>
                <div className="flex justify-between gap-4 border-t border-line pt-3 font-semibold">
                  <dt>Total</dt>
                  <dd className="font-display text-lg font-extrabold tracking-tight">
                    {formatCurrency(total)}
                  </dd>
                </div>
              </dl>

              <p className="border-t border-line pt-4 text-[11px] leading-relaxed text-muted">
                Free shipping on orders over {formatCurrency(FREE_SHIPPING_THRESHOLD)}.
                Taxes calculated at checkout in a production store.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage
