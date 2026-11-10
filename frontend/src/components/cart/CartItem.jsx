import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import QuantitySelector from '../product/QuantitySelector'
import StockBadge from '../product/StockBadge'
import { formatCurrency } from '../../utils/format'
import { PLACEHOLDER_IMAGE } from '../../utils/constants'
import { useCart } from '../../context/CartContext'

function CartItem({ item }) {
  const { incrementItem, decrementItem, removeItem } = useCart()
  const lineTotal = item.price * item.quantity

  return (
    <div className="flex gap-4 border-b border-line py-6 sm:gap-6">
      <Link
        to={`/product/${item.productId}`}
        className="block size-24 shrink-0 border border-line bg-surface sm:size-32"
      >
        <img
          src={item.image || PLACEHOLDER_IMAGE}
          alt={item.name}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src = PLACEHOLDER_IMAGE
          }}
          className="h-full w-full object-cover"
        />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="eyebrow truncate">{item.category}</p>
            <Link
              to={`/product/${item.productId}`}
              className="mt-1 block font-display text-sm font-semibold leading-snug tracking-tight hover:text-accent sm:text-base"
            >
              {item.name}
            </Link>
          </div>
          <button
            type="button"
            onClick={() => removeItem(item.productId)}
            aria-label={`Remove ${item.name} from cart`}
            className="flex size-8 shrink-0 items-center justify-center border border-transparent text-muted transition-colors hover:border-line hover:text-danger"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-1.5">
          <StockBadge stock={item.stock} />
        </div>

        <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-4">
          <div className="flex items-center gap-3">
            <QuantitySelector
              value={item.quantity}
              onChange={(value) => {
                if (value > item.quantity) incrementItem(item.productId)
                else if (value < item.quantity) decrementItem(item.productId)
              }}
              max={item.stock}
              className="h-9 [&>button]:w-8 [&>span]:w-8"
            />
            <span className="text-xs text-muted">
              {formatCurrency(item.price)} each
            </span>
          </div>
          <p className="text-sm font-semibold">{formatCurrency(lineTotal)}</p>
        </div>
      </div>
    </div>
  )
}

export default CartItem
