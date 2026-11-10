import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ShoppingBag, Trash2 } from 'lucide-react'
import CartItem from '../components/cart/CartItem'
import EmptyState from '../components/ui/EmptyState'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { useCart } from '../context/CartContext'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { formatCurrency } from '../utils/format'
import {
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING,
} from '../utils/constants'

function CartPage() {
  useDocumentTitle('Your cart')

  const { items, itemCount, subtotal, removeAll } = useCart()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const shipping =
    subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING
  const total = subtotal + shipping
  const remainingForFreeShipping = Math.max(
    FREE_SHIPPING_THRESHOLD - subtotal,
    0,
  )
  const progress = Math.min(
    (subtotal / FREE_SHIPPING_THRESHOLD) * 100,
    100,
  )

  if (items.length === 0) {
    return (
      <div className="container-shop py-16 lg:py-24">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Explore the collection and add a few considered pieces to your cart."
        >
          <Link
            to="/shop"
            className="inline-flex h-11 items-center gap-2 border border-ink bg-ink px-5 text-sm font-semibold text-paper transition-colors hover:border-accent hover:bg-accent"
          >
            Start shopping
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </EmptyState>
      </div>
    )
  }

  return (
    <div>
      <section className="border-b border-line bg-surface/50">
        <div className="container-shop py-10 lg:py-12">
          <p className="eyebrow">Your selection</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">
                Shopping cart
              </h1>
              <p className="mt-2 text-sm text-muted">
                {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
              </p>
            </div>
            <Link
              to="/shop"
              className="text-[11px] font-semibold uppercase tracking-[0.14em] underline decoration-line underline-offset-4 transition-colors hover:text-accent"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </section>

      <div className="container-shop py-8 lg:py-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px] lg:gap-14">
          <div>
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em]">
                Items
              </h2>
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted transition-colors hover:text-danger"
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
                Clear cart
              </button>
            </div>

            {items.map((item) => (
              <CartItem key={item.productId} item={item} />
            ))}

            <div className="mt-8 border border-line bg-surface/50 p-5">
              <div className="flex items-center justify-between gap-4">
                <p className="text-xs font-medium">
                  {remainingForFreeShipping > 0
                    ? `${formatCurrency(remainingForFreeShipping)} away from free shipping`
                    : 'You have unlocked free shipping'}
                </p>
                <span className="text-[10px] uppercase tracking-[0.12em] text-muted">
                  {Math.round(progress)}%
                </span>
              </div>
              <div className="mt-3 h-1 w-full bg-line">
                <div
                  className="h-full bg-accent transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>

          <aside>
            <div className="sticky top-24 border border-line bg-paper p-6">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em]">
                Order summary
              </h2>

              <dl className="mt-5 space-y-3 border-b border-line pb-5 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted">Subtotal</dt>
                  <dd className="font-medium">{formatCurrency(subtotal)}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted">Shipping</dt>
                  <dd className="font-medium">
                    {shipping === 0 ? 'Free' : formatCurrency(shipping)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-muted">Estimated tax</dt>
                  <dd className="text-xs text-muted">Calculated at checkout</dd>
                </div>
              </dl>

              <div className="flex items-baseline justify-between py-5">
                <span className="text-sm font-semibold">Total</span>
                <span className="font-display text-2xl font-extrabold tracking-tight">
                  {formatCurrency(total)}
                </span>
              </div>

              <Link
                to="/checkout"
                className="inline-flex h-12 w-full items-center justify-center gap-2 border border-ink bg-ink text-sm font-semibold text-paper transition-colors hover:border-accent hover:bg-accent"
              >
                Proceed to checkout
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>

              <p className="mt-3 text-center text-[11px] leading-relaxed text-muted">
                Secure checkout. Prices in USD. Taxes shown at the next step.
              </p>

              <ul className="mt-5 space-y-2 border-t border-line pt-4 text-[11px] text-muted">
                <li>Free shipping on orders over $150</li>
                <li>30-day returns on unused items</li>
                <li>Support available Monday to Friday</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Clear your cart?"
        description="This will remove every item from your cart. This action cannot be undone."
        confirmLabel="Clear cart"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          removeAll()
          setConfirmOpen(false)
        }}
      />
    </div>
  )
}

export default CartPage
