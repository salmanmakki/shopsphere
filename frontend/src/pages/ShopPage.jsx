import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PackageSearch, SlidersHorizontal, X } from 'lucide-react'
import SearchBar from '../components/SearchBar'
import FilterSidebar from '../components/filters/FilterSidebar'
import ProductGrid from '../components/product/ProductGrid'
import Pagination from '../components/ui/Pagination'
import EmptyState from '../components/ui/EmptyState'
import { getCategories, getProducts } from '../services/productService'
import { useDebounce } from '../hooks/useDebounce'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { PRODUCTS_PER_PAGE, SORT_OPTIONS } from '../utils/constants'

const sortValues = new Set(SORT_OPTIONS.map((option) => option.value))

const parsePage = (value) => {
  const page = Number.parseInt(value, 10)
  return Number.isFinite(page) && page > 0 ? page : 1
}

function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = useMemo(
    () => {
      const sort = searchParams.get('sort')
      return {
        search: searchParams.get('search') || '',
        category: searchParams.get('category') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        bestSeller: searchParams.get('bestSeller') === 'true',
        sort: sortValues.has(sort) ? sort : 'newest',
        page: parsePage(searchParams.get('page')),
      }
    },
    [searchParams],
  )

  const [searchInput, setSearchInput] = useState(filters.search)
  const [products, setProducts] = useState([])
  const [meta, setMeta] = useState({ total: 0, totalPages: 0 })
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const debouncedSearch = useDebounce(searchInput, 350)

  useDocumentTitle(
    filters.bestSeller
      ? 'Best sellers'
      : filters.category
        ? `${filters.category} — shop`
        : 'Shop all products',
  )

  const updateParams = useCallback(
    (updates, { replace = true, keepPage = false } = {}) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current)

          Object.entries(updates).forEach(([key, value]) => {
            if (value === '' || value === null || value === undefined) {
              next.delete(key)
            } else {
              next.set(key, String(value))
            }
          })

          if (!keepPage) next.delete('page')
          return next
        },
        { replace },
      )
    },
    [setSearchParams],
  )

  useEffect(() => {
    const nextSearch = debouncedSearch.trim()
    if (nextSearch === filters.search) return
    updateParams({ search: nextSearch })
  }, [debouncedSearch, filters.search, updateParams])

  useEffect(() => {
    getCategories()
      .then((response) => setCategories(response.data || []))
      .catch(() => setCategories([]))
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    const params = {
      page: filters.page,
      limit: PRODUCTS_PER_PAGE,
      sort: filters.sort,
    }

    if (filters.search) params.search = filters.search
    if (filters.category) params.category = filters.category
    if (filters.minPrice) params.minPrice = filters.minPrice
    if (filters.maxPrice) params.maxPrice = filters.maxPrice
    if (filters.bestSeller) params.bestSeller = 'true'

    setLoading(true)
    setError('')

    getProducts(params, { signal: controller.signal })
      .then((response) => {
        if (controller.signal.aborted) return
        setProducts(response.data || [])
        setMeta(response.meta || { total: 0, totalPages: 0 })
      })
      .catch((requestError) => {
        if (controller.signal.aborted || requestError.isCancel) return
        setProducts([])
        setMeta({ total: 0, totalPages: 0 })
        setError(requestError.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [
    filters.search,
    filters.category,
    filters.minPrice,
    filters.maxPrice,
    filters.bestSeller,
    filters.sort,
    filters.page,
    refreshKey,
  ])

  const handleClear = () => {
    setSearchInput('')
    setFiltersOpen(false)
    updateParams({
      search: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      bestSeller: '',
    })
  }

  const handleCategoryChange = (category) => {
    updateParams({ category })
  }

  const handlePriceApply = ({ minPrice, maxPrice }) => {
    updateParams({ minPrice, maxPrice })
    setFiltersOpen(false)
  }

  const handleSortChange = (event) => {
    updateParams({ sort: event.target.value })
  }

  const handlePageChange = (page) => {
    updateParams({ page: page === 1 ? '' : page }, { replace: false })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const hasActiveFilters =
    Boolean(filters.search) ||
    Boolean(filters.category) ||
    Boolean(filters.minPrice) ||
    Boolean(filters.maxPrice) ||
    filters.bestSeller

  return (
    <div>
      <section className="border-b border-line bg-surface/50">
        <div className="container-shop py-10 lg:py-14">
          <p className="eyebrow">The collection</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl lg:text-5xl">
                {filters.bestSeller
                  ? 'Best sellers'
                  : filters.category || 'All products'}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
                {filters.bestSeller
                  ? 'The pieces our customers return to again and again — quietly popular, consistently good.'
                  : filters.category
                    ? `Everything in ${filters.category.toLowerCase()}, chosen for quality and everyday use.`
                    : 'A considered collection of apparel, accessories, and homeware. Filter by category, price, or search the full catalogue.'}
              </p>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClear}
                className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted underline decoration-line underline-offset-4 transition-colors hover:text-ink"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="container-shop py-8 lg:py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <SearchBar
              value={searchInput}
              onChange={setSearchInput}
              onClear={() => {
                setSearchInput('')
                updateParams({ search: '' })
              }}
              placeholder="Search by product name or description"
            />
          </div>

          <div className="flex items-center gap-3">
            <label htmlFor="shop-sort" className="sr-only">
              Sort products
            </label>
            <select
              id="shop-sort"
              value={filters.sort}
              onChange={handleSortChange}
              className="h-12 flex-1 border border-line bg-paper px-3 text-sm focus:border-ink focus:outline-none sm:w-52 sm:flex-none"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setFiltersOpen((open) => !open)}
              aria-expanded={filtersOpen}
              className="inline-flex h-12 items-center gap-2 border border-line px-4 text-[11px] font-semibold uppercase tracking-[0.12em] transition-colors hover:border-ink lg:hidden"
            >
              {filtersOpen ? (
                <X className="size-4" aria-hidden="true" />
              ) : (
                <SlidersHorizontal className="size-4" aria-hidden="true" />
              )}
              Filters
            </button>
          </div>
        </div>

        {filtersOpen && (
          <div className="mt-4 border border-line bg-paper p-5 lg:hidden">
            <FilterSidebar
              categories={categories}
              filters={filters}
              onCategoryChange={handleCategoryChange}
              onPriceApply={handlePriceApply}
              onClear={handleClear}
            />
          </div>
        )}

        <div className="mt-8 lg:grid lg:grid-cols-[220px_1fr] lg:gap-10">
          <aside className="hidden lg:block">
            <div className="sticky top-40">
              <FilterSidebar
                categories={categories}
                filters={filters}
                onCategoryChange={handleCategoryChange}
                onPriceApply={handlePriceApply}
                onClear={handleClear}
              />
            </div>
          </aside>

          <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
              <p className="text-xs text-muted">
                {loading
                  ? 'Loading products…'
                  : `${meta.total} ${meta.total === 1 ? 'product' : 'products'}${
                      filters.search ? ` for “${filters.search}”` : ''
                    }`}
              </p>
              {(filters.minPrice || filters.maxPrice) && (
                <p className="text-xs text-muted">
                  Price:{' '}
                  {filters.minPrice ? `$${filters.minPrice}` : '$0'} –{' '}
                  {filters.maxPrice ? `$${filters.maxPrice}` : 'Any'}
                </p>
              )}
            </div>

            {error ? (
              <div className="border border-line bg-surface/60 px-6 py-12 text-center">
                <p className="text-sm text-muted">{error}</p>
                <button
                  type="button"
                  onClick={() => setRefreshKey((key) => key + 1)}
                  className="mt-5 inline-flex h-10 items-center border border-ink px-5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors hover:bg-ink hover:text-paper"
                >
                  Try again
                </button>
              </div>
            ) : !loading && products.length === 0 ? (
              <EmptyState
                icon={PackageSearch}
                title="No products found"
                description="Try a different search, remove a filter, or browse the full collection."
              >
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex h-10 items-center border border-ink px-5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors hover:bg-ink hover:text-paper"
                >
                  Clear filters
                </button>
              </EmptyState>
            ) : (
              <ProductGrid
                products={products}
                loading={loading}
                skeletonCount={PRODUCTS_PER_PAGE}
              />
            )}

            {!loading && !error && (
              <Pagination
                page={filters.page}
                totalPages={meta.totalPages}
                onChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShopPage
