import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Layers,
  Package,
  PackageX,
  Plus,
  RefreshCcw,
  TrendingUp,
} from 'lucide-react'
import Skeleton from '../../components/ui/Skeleton'
import { getDashboard } from '../../services/adminService'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { formatCurrency } from '../../utils/format'
import { PLACEHOLDER_IMAGE } from '../../utils/constants'

const statCards = [
  {
    key: 'totalProducts',
    label: 'Total products',
    icon: Package,
    accent: false,
  },
  {
    key: 'totalCategories',
    label: 'Categories',
    icon: Layers,
    accent: false,
  },
  {
    key: 'totalStock',
    label: 'Units in stock',
    icon: TrendingUp,
    accent: false,
  },
  {
    key: 'inStock',
    label: 'Healthy stock',
    icon: CheckCircle2,
    accent: false,
  },
  {
    key: 'lowStock',
    label: 'Low stock',
    icon: AlertTriangle,
    accent: true,
  },
  {
    key: 'outOfStock',
    label: 'Out of stock',
    icon: PackageX,
    accent: false,
  },
]

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid gap-px border border-line bg-line sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-paper p-5">
            <Skeleton className="h-2.5 w-20" />
            <Skeleton className="mt-4 h-8 w-16" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="border border-line bg-paper p-6 lg:col-span-2">
          <Skeleton className="h-4 w-32" />
          <div className="mt-6 space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-12 w-full" />
            ))}
          </div>
        </div>
        <div className="border border-line bg-paper p-6">
          <Skeleton className="h-4 w-28" />
          <div className="mt-6 space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function AdminDashboardPage() {
  useDocumentTitle('Admin overview')

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true

    setLoading(true)
    setError('')

    getDashboard()
      .then((response) => {
        if (active) setData(response.data)
      })
      .catch((requestError) => {
        if (active) setError(requestError.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [refreshKey])

  const stats = data?.stats || {}
  const recentProducts = data?.recentProducts || []
  const lowStockThreshold = data?.lowStockThreshold ?? 5
  const totalProducts = stats.totalProducts || 0

  const stockRows = [
    {
      label: 'Healthy stock',
      value: stats.inStock || 0,
      color: 'bg-success',
    },
    { label: 'Low stock', value: stats.lowStock || 0, color: 'bg-accent' },
    { label: 'Out of stock', value: stats.outOfStock || 0, color: 'bg-danger' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
            Store overview
          </p>
          <h2 className="mt-2 font-display text-2xl font-extrabold tracking-[-0.02em] sm:text-3xl">
            Everything at a glance
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted">
            A live summary of your catalogue, categories, and inventory health.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/admin/products"
            className="inline-flex h-10 items-center gap-2 border border-line bg-paper px-4 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors hover:border-ink"
          >
            Manage products
          </Link>
          <Link
            to="/admin/products/new"
            className="inline-flex h-10 items-center gap-2 border border-ink bg-ink px-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-paper transition-colors hover:border-accent hover:bg-accent"
          >
            <Plus className="size-3.5" aria-hidden="true" />
            Add product
          </Link>
        </div>
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : error ? (
        <div className="border border-line bg-paper px-6 py-14 text-center">
          <p className="text-sm text-muted">{error}</p>
          <button
            type="button"
            onClick={() => setRefreshKey((key) => key + 1)}
            className="mt-5 inline-flex h-10 items-center gap-2 border border-ink px-5 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors hover:bg-ink hover:text-paper"
          >
            <RefreshCcw className="size-3.5" aria-hidden="true" />
            Try again
          </button>
        </div>
      ) : (
        <>
          <div className="grid gap-px border border-line bg-line sm:grid-cols-2 xl:grid-cols-3">
            {statCards.map((card) => {
              const Icon = card.icon
              const isAlert = card.key === 'lowStock' && (stats.lowStock || 0) > 0
              return (
                <div key={card.key} className="bg-paper p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                      {card.label}
                    </p>
                    <Icon
                      className={
                        isAlert
                          ? 'size-4 text-danger'
                          : 'size-4 text-muted/60'
                      }
                      aria-hidden="true"
                    />
                  </div>
                  <p
                    className={`mt-3 font-display text-3xl font-extrabold tracking-[-0.02em] ${
                      isAlert ? 'text-danger' : 'text-ink'
                    }`}
                  >
                    {stats[card.key] ?? 0}
                  </p>
                  {card.key === 'lowStock' && (
                    <p className="mt-1 text-[10px] text-muted">
                      Threshold: {lowStockThreshold} units
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="border border-line bg-paper lg:col-span-2">
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <div>
                  <h3 className="text-sm font-semibold">Recently added</h3>
                  <p className="mt-0.5 text-[11px] text-muted">
                    The five newest products in your catalogue
                  </p>
                </div>
                <Link
                  to="/admin/products"
                  className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted transition-colors hover:text-ink"
                >
                  View all
                  <ArrowRight className="size-3" aria-hidden="true" />
                </Link>
              </div>

              {recentProducts.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <p className="text-sm text-muted">
                    No products yet. Add your first piece to get started.
                  </p>
                  <Link
                    to="/admin/products/new"
                    className="mt-4 inline-flex h-9 items-center gap-2 border border-ink bg-ink px-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-paper"
                  >
                    <Plus className="size-3" aria-hidden="true" />
                    Add product
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-line text-[10px] uppercase tracking-[0.12em] text-muted">
                        <th className="px-5 py-3 font-medium">Product</th>
                        <th className="px-3 py-3 font-medium">Price</th>
                        <th className="px-3 py-3 font-medium">Stock</th>
                        <th className="px-5 py-3 text-right font-medium">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentProducts.map((product) => (
                        <tr
                          key={product._id}
                          className="border-b border-line last:border-0"
                        >
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div className="size-10 shrink-0 border border-line bg-surface">
                                <img
                                  src={product.image || PLACEHOLDER_IMAGE}
                                  alt=""
                                  onError={(event) => {
                                    event.currentTarget.src = PLACEHOLDER_IMAGE
                                  }}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="max-w-44 truncate font-medium">
                                  {product.name}
                                </p>
                                <p className="text-[11px] text-muted">
                                  {product.category}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-3 text-xs">
                            {formatCurrency(product.price)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-3">
                            <span
                              className={
                                product.stock === 0
                                  ? 'text-xs font-medium text-danger'
                                  : product.stock <= lowStockThreshold
                                    ? 'text-xs font-medium text-accent'
                                    : 'text-xs text-muted'
                              }
                            >
                              {product.stock} units
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <Link
                              to={`/admin/products/${product._id}/edit`}
                              className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted underline decoration-line underline-offset-4 transition-colors hover:text-ink"
                            >
                              Edit
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="border border-line bg-paper">
              <div className="border-b border-line px-5 py-4">
                <h3 className="text-sm font-semibold">Inventory health</h3>
                <p className="mt-0.5 text-[11px] text-muted">
                  Distribution across {totalProducts} products
                </p>
              </div>

              <div className="space-y-5 p-5">
                {stockRows.map((row) => {
                  const percentage =
                    totalProducts === 0
                      ? 0
                      : Math.round((row.value / totalProducts) * 100)
                  return (
                    <div key={row.label}>
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="text-muted">{row.label}</span>
                        <span className="font-semibold tabular-nums">
                          {row.value}
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 w-full bg-surface">
                        <div
                          className={`h-full ${row.color}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="border-t border-line p-5">
                <p className="text-xs leading-relaxed text-muted">
                  Products at or below{' '}
                  <span className="font-semibold text-ink">
                    {lowStockThreshold} units
                  </span>{' '}
                  are flagged as low stock. Restock before they sell out.
                </p>
                <Link
                  to="/admin/products"
                  className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 border border-line text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors hover:border-ink"
                >
                  Review inventory
                  <ArrowRight className="size-3" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AdminDashboardPage
