import { Link } from 'react-router-dom'
import { Check, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCart } from '../../context/CartContext'
import {
  formatCurrency,
  getDiscountPercent,
  getStockStatus,
} from '../../utils/format'
import { PLACEHOLDER_IMAGE } from '../../utils/constants'
import StockBadge from './StockBadge'

function ProductCard({ product }) {
  const { items, addItem } = useCart()
  const isOutOfStock = getStockStatus(product.stock) === 'out'
  const cartItem = items.find((item) => item.productId === product._id)
  const atLimit = Boolean(cartItem && cartItem.quantity >= product.stock)
  const discount = getDiscountPercent(product.price, product.originalPrice)

  const handleAdd = () => {
    if (isOutOfStock) {
      toast.error('This product is currently out of stock.')
      return
    }

    if (atLimit) {
      toast.error('You already have the maximum available stock in your cart.')
      return
    }

    if (addItem(product, 1)) {
      toast.success(`${product.name} added to your cart.`)
    }
  }

  return (
    <article className="group flex flex-col">
      <Link
        to={`/product/${product._id}`}
        className="relative block aspect-[4/5] overflow-hidden border border-line bg-surface transition-colors group-hover:border-ink/40"
      >
        <img
          src={product.image || PLACEHOLDER_IMAGE}
          alt={product.name}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src = PLACEHOLDER_IMAGE
          }}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        {discount && (
          <span className="absolute left-3 top-3 bg-paper px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]">
            -{discount}%
          </span>
        )}
        {isOutOfStock && (
          <span className="absolute inset-x-0 bottom-0 bg-ink/85 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-paper">
            Out of stock
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col pt-4">
        <div className="flex items-center justify-between gap-3">
          <p className="eyebrow truncate">{product.category}</p>
          <StockBadge stock={product.stock} className="shrink-0" />
        </div>

        <Link
          to={`/product/${product._id}`}
          className="mt-2 font-display text-sm font-semibold leading-snug tracking-tight transition-colors hover:text-accent sm:text-base"
        >
          {product.name}
        </Link>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-sm font-semibold">
            {formatCurrency(product.price)}
          </span>
          {product.originalPrice > product.price && (
            <span className="text-xs text-muted line-through">
              {formatCurrency(product.originalPrice)}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={isOutOfStock}
          className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 border border-ink bg-paper text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors hover:bg-ink hover:text-paper disabled:cursor-not-allowed disabled:border-line disabled:bg-surface disabled:text-muted"
          aria-label={`Add ${product.name} to cart`}
        >
          {isOutOfStock ? (
            'Unavailable'
          ) : atLimit ? (
            <>
              <Check className="size-3.5" aria-hidden="true" />
              In cart
            </>
          ) : (
            <>
              <Plus className="size-3.5" aria-hidden="true" />
              Add to cart
            </>
          )}
        </button>
      </div>
    </article>
  )
}

export default ProductCard
