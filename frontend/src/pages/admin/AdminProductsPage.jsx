import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Package,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import SearchBar from '../../components/SearchBar'
import Pagination from '../../components/ui/Pagination'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import StockBadge from '../../components/product/StockBadge'
import Badge from '../../components/ui/Badge'
import { TableRowSkeleton } from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import {
  deleteProduct,
  getAdminProducts,
} from '../../services/adminService'
import { useDebounce } from '../../hooks/useDebounce'
import { useDocumentTitle } from '../../hooks/useDocumentTitle'
import { formatCurrency } from '../../utils/format'
import { SORT_OPTIONS, PLACEHOLDER_IMAGE } from '../../utils/constants'

function AdminProductsPage() {
  useDocumentTitle('Admin products')

  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)
  const [products, setProducts] = useState([])
  const [meta, setMeta] = useState({ total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const debouncedSearch = useDebounce(search.trim(), 350)

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, sort])

  useEffect(() => {
    let active = true

    const params = { page, limit: 20, sort }
    if (debouncedSearch) params.search = debouncedSearch

    setLoading(true)
    setError('')

    getAdminProducts(params)
      .then((response) => {
        if (!active) return
        setProducts(response.data || [])
        setMeta(response.meta || { total: 0, totalPages: 0 })
      })
      .catch((requestError) => {
        if (!active) return
        setProducts([])
        setMeta({ total: 0, totalPages: 0 })
        setError(requestError.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [debouncedSearch, sort, page, refreshKey])

  const handleDelete = async () => {
    if (!deleteTarget) return

    setDeleting(true)
    try {
      await deleteProduct(deleteTarget._id)
      toast.success(`${deleteTarget.name} was deleted.`)
      setDeleteTarget(null)

      if (products.length === 1 && page > 1) {
        setPage((current) => current - 1)
      } else {
        setRefreshKey((key) => key + 1)
      }
    } catch (requestError) {
      toast.error(requestError.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
            Catalogue
          </p>
          <h2 className="mt-2 font-display text-2xl font-extrabold tracking-[-0.02em] sm:text-3xl">
            Products
          </h2>
          <p className="mt-2 text-sm text-muted">
            Search, edit, and retire products across the storefront.
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

      <div className="flex flex-col gap-3 border border-line bg-paper p-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={setSearch}
            onClear={() => setSearch('')}
            placeholder="Search products by name"
          />
        </div>
        <div className="flex items-center gap-3">
          <label htmlFor="admin-sort" className="sr-only">
            Sort products
          </label>
          <select
            id="admin-sort"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="h-12 flex-1 border border-line bg-paper px-3 text-sm focus:border-ink focus:outline-none sm:w-48 sm:flex-none"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setRefreshKey((key) => key + 1)}
            aria-label="Refresh products"
            className="flex size-12 shrink-0 items-center justify-center border border-line transition-colors hover:border-ink"
          >
            <RefreshCcw className="size-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="border border-line bg-paper">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3">
          <p className="text-xs text-muted">
            {loading
              ? 'Loading products…'
              : `${meta.total} ${meta.total === 1 ? 'product' : 'products'}`}
          </p>
          {debouncedSearch && (
            <p className="text-xs text-muted">
              Results for “{debouncedSearch}”
            </p>
          )}
        </div>

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
        ) : !loading && products.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={Package}
              title={debouncedSearch ? 'No matching products' : 'No products yet'}
              description={
                debouncedSearch
                  ? 'Try a different search term or clear the search to see everything.'
                  : 'Add your first product to start building the storefront catalogue.'
              }
            >
              {debouncedSearch ? (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="inline-flex h-9 items-center gap-2 border border-ink px-4 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors hover:bg-ink hover:text-paper"
                >
                  <Search className="size-3" aria-hidden="true" />
                  Clear search
                </button>
              ) : (
                <Link
                  to="/admin/products/new"
                  className="inline-flex h-9 items-center gap-2 border border-ink bg-ink px-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-paper transition-colors hover:border-accent hover:bg-accent"
                >
                  <Plus className="size-3" aria-hidden="true" />
                  Add product
                </Link>
              )}
            </EmptyState>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-line text-[10px] uppercase tracking-[0.12em] text-muted">
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-3 py-3 font-medium">Category</th>
                  <th className="px-3 py-3 font-medium">Price</th>
                  <th className="px-3 py-3 font-medium">Stock</th>
                  <th className="px-3 py-3 font-medium">Visibility</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 5 }).map((_, index) => (
                      <TableRowSkeleton key={index} columns={6} />
                    ))
                  : products.map((product) => (
                      <tr
                        key={product._id}
                        className="border-b border-line last:border-0 hover:bg-surface/40"
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="size-11 shrink-0 border border-line bg-surface">
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
                              <p className="max-w-56 truncate font-medium">
                                {product.name}
                              </p>
                              <p className="mt-0.5 text-[10px] uppercase tracking-[0.1em] text-muted">
                                ID {product._id.slice(-6)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-xs text-muted">
                          {product.category}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-xs">
                          <span className="font-medium">
                            {formatCurrency(product.price)}
                          </span>
                          {product.originalPrice > product.price && (
                            <span className="ml-1.5 text-muted line-through">
                              {formatCurrency(product.originalPrice)}
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3">
                          <div className="flex flex-col gap-1">
                            <span className="text-xs font-medium">
                              {product.stock} units
                            </span>
                            <StockBadge stock={product.stock} />
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap gap-1">
                            {product.isFeatured && (
                              <Badge variant="accent">Featured</Badge>
                            )}
                            {product.isBestSeller && (
                              <Badge variant="dark">Best seller</Badge>
                            )}
                            {!product.isFeatured && !product.isBestSeller && (
                              <span className="text-[10px] uppercase tracking-[0.1em] text-muted">
                                Standard
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-1">
                            <Link
                              to={`/admin/products/${product._id}/edit`}
                              aria-label={`Edit ${product.name}`}
                              className="flex size-8 items-center justify-center border border-transparent text-muted transition-colors hover:border-line hover:text-ink"
                            >
                              <Pencil className="size-3.5" aria-hidden="true" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(product)}
                              aria-label={`Delete ${product.name}`}
                              className="flex size-8 items-center justify-center border border-transparent text-muted transition-colors hover:border-line hover:text-danger"
                            >
                              <Trash2 className="size-3.5" aria-hidden="true" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && !error && (
        <Pagination
          page={page}
          totalPages={meta.totalPages}
          onChange={setPage}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete this product?"
        description={
          deleteTarget
            ? `“${deleteTarget.name}” will be permanently removed from the storefront and the catalogue. This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete product"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  )
}

export default AdminProductsPage
