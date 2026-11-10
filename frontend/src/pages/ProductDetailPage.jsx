import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowRight,
  ChevronRight,
  PackageX,
  RotateCcw,
  ShieldCheck,
  Truck,
} from 'lucide-react'
import toast from 'react-hot-toast'
import QuantitySelector from '../components/product/QuantitySelector'
import StockBadge from '../components/product/StockBadge'
import ProductGrid from '../components/product/ProductGrid'
import SectionHeading from '../components/ui/SectionHeading'
import EmptyState from '../components/ui/EmptyState'
import Skeleton from '../components/ui/Skeleton'
import { useCart } from '../context/CartContext'
import { getProduct, getProducts } from '../services/productService'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import {
  formatCurrency,
  getDiscountPercent,
  getStockStatus,
} from '../utils/format'
import { PLACEHOLDER_IMAGE } from '../utils/constants'

function ProductDetailSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
      <Skeleton className="aspect-[4/5] w-full border border-line" />
      <div className="space-y-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-10 w-4/5" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-56" />
      </div>
    </div>
  )
}

function ProductDetailPage() {
  const { id } = useParams()
  const { items, addItem } = useCart()

  const [product, setProduct] = useState(null)
  const [related, setRelated] = useState([])
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notFound, setNotFound] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useDocumentTitle(product ? product.name : 'Product')

  useEffect(() => {
    const controller = new AbortController()

    const load = async () => {
      setLoading(true)
      setError('')
      setNotFound(false)
      setRelated([])

      try {
        const response = await getProduct(id, { signal: controller.signal })
        if (controller.signal.aborted) return

        const nextProduct = response.data
        setProduct(nextProduct)
        setQuantity(1)
        setLoading(false)

        if (nextProduct?.category) {
          try {
            const relatedResponse = await getProducts(
              { category: nextProduct.category, limit: 5, sort: 'newest' },
              { signal: controller.signal },
            )
            if (!controller.signal.aborted) {
              setRelated(
                (relatedResponse.data || [])
                  .filter((item) => item._id !== nextProduct._id)
                  .slice(0, 4),
              )
            }
          } catch {
            if (!controller.signal.aborted) setRelated([])
          }
        }
      } catch (requestError) {
        if (controller.signal.aborted || requestError.isCancel) return
        setProduct(null)
        setNotFound(requestError.status === 404)
        setError(requestError.message)
        setLoading(false)
      }
    }

    load()

    return () => controller.abort()
  }, [id, refreshKey])

  if (loading) {
    return (
      <div className="container-shop py-10 lg:py-14">
        <ProductDetailSkeleton />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="container-shop py-16 lg:py-24">
        <EmptyState
          icon={PackageX}
          title="Product not found"
          description="The piece you are looking for may have sold out or been removed from the collection."
        >
          <Link
            to="/shop"
            className="inline-flex h-11 items-center gap-2 border border-ink bg-ink px-5 text-sm font-semibold text-paper transition-colors hover:border-accent hover:bg-accent"
          >
            Browse the collection
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </EmptyState>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container-shop py-16 lg:py-24">
        <div className="border border-line bg-surface/60 px-6 py-14 text-center">
          <p className="text-sm text-muted">
            {error || 'This product could not be loaded.'}
          </p>
          <button
            type="button"
            onClick={() => setRefreshKey((key) => key + 1)}
            className="mt-5 inline-flex h-10 items-center border border-ink px-5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors hover:bg-ink hover:text-paper"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  const stockStatus = getStockStatus(product.stock)
  const isOutOfStock = stockStatus === 'out'
  const discount = getDiscountPercent(product.price, product.originalPrice)
  const cartItem = items.find((item) => item.productId === product._id)
  const remaining = product.stock - (cartItem?.quantity || 0)

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error('This product is currently out of stock.')
      return
    }

    if (remaining <= 0) {
      toast.error('You already have the maximum available stock in your cart.')
      return
    }

    if (addItem(product, Math.min(quantity, remaining))) {
      toast.success(`${product.name} added to your cart.`)
    }
  }

  return (
    <div>
      <div className="border-b border-line">
        <div className="container-shop flex flex-wrap items-center gap-1.5 py-4 text-[11px] text-muted">
          <Link to="/" className="transition-colors hover:text-ink">
            Home
          </Link>
          <ChevronRight className="size-3" aria-hidden="true" />
          <Link to="/shop" className="transition-colors hover:text-ink">
            Shop
          </Link>
          <ChevronRight className="size-3" aria-hidden="true" />
          <Link
            to={`/shop?category=${encodeURIComponent(product.category)}`}
            className="transition-colors hover:text-ink"
          >
            {product.category}
          </Link>
          <ChevronRight className="size-3" aria-hidden="true" />
          <span className="max-w-48 truncate text-ink sm:max-w-none">
            {product.name}
          </span>
        </div>
      </div>

      <div className="container-shop py-10 lg:py-14">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          <div className="relative">
            <div className="relative aspect-[4/5] w-full overflow-hidden border border-line bg-surface">
              <img
                src={product.image || PLACEHOLDER_IMAGE}
                alt={product.name}
                onError={(event) => {
                  event.currentTarget.src = PLACEHOLDER_IMAGE
                }}
                className="h-full w-full object-cover"
              />
              {discount && (
                <span className="absolute left-4 top-4 bg-paper px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]">
                  Save {discount}%
                </span>
              )}
            </div>
            <p className="mt-3 text-[10px] uppercase tracking-[0.14em] text-muted">
              Product imagery is representative of colour and finish.
            </p>
          </div>

          <div className="flex flex-col">
            <p className="eyebrow">{product.category}</p>
            <h1 className="mt-3 font-display text-3xl font-extrabold leading-[1.05] tracking-[-0.03em] sm:text-4xl">
              {product.name}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
              <span className="text-xl font-semibold">
                {formatCurrency(product.price)}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-sm text-muted line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
              <span className="text-line" aria-hidden="true">
                |
              </span>
              <StockBadge stock={product.stock} />
            </div>

            <p className="mt-7 whitespace-pre-line text-sm leading-[1.8] text-muted">
              {product.description || 'No description provided for this piece.'}
            </p>

            <div className="mt-8 border-t border-line pt-6">
              <div className="flex flex-col gap-3 sm:flex-row">
                <QuantitySelector
                  value={Math.min(quantity, Math.max(product.stock, 1))}
                  onChange={setQuantity}
                  max={Math.max(product.stock, 1)}
                  disabled={isOutOfStock}
                  className="w-fit"
                />
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className="inline-flex h-11 flex-1 items-center justify-center border border-ink bg-ink px-6 text-sm font-semibold text-paper transition-colors hover:border-accent hover:bg-accent disabled:cursor-not-allowed disabled:border-line disabled:bg-surface disabled:text-muted"
                >
                  {isOutOfStock
                    ? 'Out of stock'
                    : remaining <= 0
                      ? 'Maximum quantity in cart'
                      : 'Add to cart'}
                </button>
              </div>

              {!isOutOfStock && remaining > 0 && remaining <= 5 && (
                <p className="mt-3 text-xs text-accent">
                  Only {remaining} more {remaining === 1 ? 'unit' : 'units'} can
                  be added to your cart.
                </p>
              )}

              <Link
                to="/cart"
                className="mt-3 inline-flex h-11 w-full items-center justify-center border border-line text-sm font-semibold transition-colors hover:border-ink"
              >
                View cart
              </Link>
            </div>

            <ul className="mt-8 divide-y divide-line border-y border-line">
              <li className="flex items-start gap-3 py-4">
                <Truck className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium">Free shipping over $150</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted">
                    Dispatched within 48 hours, Monday to Friday.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3 py-4">
                <RotateCcw className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium">30-day returns</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted">
                    Return unworn or unused pieces in original packaging.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3 py-4">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium">Secure checkout</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted">
                    Your details are encrypted and never shared.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="container-shop pt-10 lg:pt-14">
          <SectionHeading
            eyebrow="More to consider"
            title={`More in ${product.category}`}
            action={
              <Link
                to={`/shop?category=${encodeURIComponent(product.category)}`}
                className="inline-flex h-10 items-center gap-2 border border-line px-4 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors hover:border-ink"
              >
                View category
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            }
          />
          <div className="pt-8">
            <ProductGrid products={related} />
          </div>
        </section>
      )}
    </div>
  )
}

export default ProductDetailPage
