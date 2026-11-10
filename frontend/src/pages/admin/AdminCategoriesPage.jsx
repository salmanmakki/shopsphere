import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowUpRight,
  Layers,
  Plus,
  RefreshCcw,
} from 'lucide-react'
import SearchBar from '../../components/SearchBar'
import EmptyState from '../../components/ui/EmptyState'
import Skeleton from '../../components/ui/Skeleton'
import { getCategories } from '../../services/productService'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { PLACEHOLDER_IMAGE } from '../../utils/constants'

function AdminCategoriesPage() {
  useDocumentTitle('Admin categories')

  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true

    setLoading(true)
    setError('')

    getCategories()
      .then((response) => {
        if (active) setCategories(response.data || [])
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

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return categories
    return categories.filter((category) =>
      category.name.toLowerCase().includes(query),
    )
  }, [categories, search])

  const totals = useMemo(
    () =>
      categories.reduce(
        (accumulator, category) => ({
          products: accumulator.products + category.count,
          inStock: accumulator.inStock + category.inStock,
          lowStock: accumulator.lowStock + category.lowStock,
          outOfStock: accumulator.outOfStock + category.outOfStock,
        }),
        { products: 0, inStock: 0, lowStock: 0, outOfStock: 0 },
      ),
    [categories],
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
            Catalogue structure
          </p>
          <h2 className="mt-2 font-display text-2xl font-extrabold tracking-[-0.02em] sm:text-3xl">
            Categories
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Categories are created from product listings. Rename a category by
            editing each product that belongs to it.
          </p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex h-10 items-center gap-2 border border-ink bg-ink px-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-paper transition-colors hover:border-accent hover:bg-accent"
        >
          <Plus className="size-3.5" aria-hidden="true" />
          Add product
        </Link>
      </div>

      <div className="grid gap-px border border-line bg-line sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Categories', value: categories.length },
          { label: 'Products', value: totals.products },
          { label: 'Low stock', value: totals.lowStock },
          { label: 'Out of stock', value: totals.outOfStock },
        ].map((item) => (
          <div key={item.label} className="bg-paper p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
              {item.label}
            </p>
            <p className="mt-3 font-display text-3xl font-extrabold tracking-[-0.02em]">
              {loading ? '—' : item.value}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 border border-line bg-paper p-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={setSearch}
            onClear={() => setSearch('')}
            placeholder="Search categories"
          />
        </div>
        <button
          type="button"
          onClick={() => setRefreshKey((key) => key + 1)}
          className="inline-flex h-12 items-center gap-2 border border-line px-4 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors hover:border-ink"
        >
          <RefreshCcw className="size-3.5" aria-hidden="true" />
          Refresh
        </button>
      </div>

      <div className="border border-line bg-paper">
        {error ? (
          <div className="px-5 py-14 text-center">
            <p className="text-sm text-muted">{error}</p>
            <button
              type="button"
              onClick={() => setRefreshKey((key) => key + 1)}
              className="mt-4 inline-flex h-9 items-center border border-ink px-4 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors hover:bg-ink hover:text-paper"
            >
              Try again
            </button>
          </div>
        ) : loading ? (
          <div className="space-y-px">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4 p-5">
                <Skeleton className="size-10 border border-line" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="ml-auto h-3 w-16" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={Layers}
              title={
                categories.length === 0
                  ? 'No categories yet'
                  : 'No matching categories'
              }
              description={
                categories.length === 0
                  ? 'Categories appear automatically once you add products to the catalogue.'
                  : 'Try a different search term or clear the search.'
              }
            >
              {categories.length === 0 ? (
                <Link
                  to="/admin/products/new"
                  className="inline-flex h-9 items-center gap-2 border border-ink bg-ink px-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-paper transition-colors hover:border-accent hover:bg-accent"
                >
                  <Plus className="size-3" aria-hidden="true" />
                  Add product
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="inline-flex h-9 items-center border border-ink px-4 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors hover:bg-ink hover:text-paper"
                >
                  Clear search
                </button>
              )}
            </EmptyState>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-[10px] uppercase tracking-[0.12em] text-muted">
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-3 py-3 font-medium">Products</th>
                  <th className="px-3 py-3 font-medium">Healthy</th>
                  <th className="px-3 py-3 font-medium">Low</th>
                  <th className="px-3 py-3 font-medium">Out</th>
                  <th className="px-5 py-3 text-right font-medium">Storefront</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((category) => (
                  <tr
                    key={category.name}
                    className="border-b border-line last:border-0 hover:bg-surface/40"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="size-10 shrink-0 border border-line bg-surface">
                          <img
                            src={category.image || PLACEHOLDER_IMAGE}
                            alt=""
                            onError={(event) => {
                              event.currentTarget.src = PLACEHOLDER_IMAGE
                            }}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <span className="font-medium">{category.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs font-medium">
                      {category.count}
                    </td>
                    <td className="px-3 py-3 text-xs text-muted">
                      {category.inStock}
                    </td>
                    <td className="px-3 py-3 text-xs">
                      <span
                        className={
                          category.lowStock > 0
                            ? 'font-medium text-accent'
                            : 'text-muted'
                        }
                      >
                        {category.lowStock}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs">
                      <span
                        className={
                          category.outOfStock > 0
                            ? 'font-medium text-danger'
                            : 'text-muted'
                        }
                      >
                        {category.outOfStock}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        to={`/shop?category=${encodeURIComponent(category.name)}`}
                        className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted transition-colors hover:text-ink"
                      >
                        View
                        <ArrowUpRight className="size-3" aria-hidden="true" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminCategoriesPage
