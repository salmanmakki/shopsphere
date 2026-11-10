import { useEffect, useId, useState } from 'react'
import { cn } from '../../utils/cn'

function FilterSidebar({
  categories = [],
  filters,
  onCategoryChange,
  onPriceApply,
  onClear,
}) {
  const id = useId()
  const [minPrice, setMinPrice] = useState(filters.minPrice || '')
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice || '')
  const [priceError, setPriceError] = useState('')

  useEffect(() => {
    setMinPrice(filters.minPrice || '')
    setMaxPrice(filters.maxPrice || '')
    setPriceError('')
  }, [filters.minPrice, filters.maxPrice])

  const applyPrice = (event) => {
    event.preventDefault()

    const min = minPrice === '' ? null : Number(minPrice)
    const max = maxPrice === '' ? null : Number(maxPrice)

    if (min != null && (!Number.isFinite(min) || min < 0)) {
      setPriceError('Enter a valid minimum price.')
      return
    }
    if (max != null && (!Number.isFinite(max) || max < 0)) {
      setPriceError('Enter a valid maximum price.')
      return
    }
    if (min != null && max != null && min > max) {
      setPriceError('Minimum price cannot be greater than maximum price.')
      return
    }

    setPriceError('')
    onPriceApply({ minPrice, maxPrice })
  }

  const hasFilters =
    Boolean(filters.search) ||
    Boolean(filters.category) ||
    Boolean(filters.minPrice) ||
    Boolean(filters.maxPrice)

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between border-b border-line pb-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em]">
            Categories
          </h2>
          {hasFilters && (
            <button
              type="button"
              onClick={onClear}
              className="text-[11px] font-medium text-muted underline decoration-line underline-offset-4 transition-colors hover:text-ink"
            >
              Clear all
            </button>
          )}
        </div>

        <ul className="mt-3 space-y-1">
          <li>
            <button
              type="button"
              onClick={() => onCategoryChange('')}
              className={cn(
                'flex w-full items-center justify-between px-2 py-2 text-left text-sm transition-colors hover:bg-surface',
                !filters.category && 'font-semibold text-ink',
              )}
            >
              <span>All categories</span>
            </button>
          </li>
          {categories.map((category) => (
            <li key={category.name}>
              <button
                type="button"
                onClick={() => onCategoryChange(category.name)}
                className={cn(
                  'flex w-full items-center justify-between gap-2 px-2 py-2 text-left text-sm transition-colors hover:bg-surface',
                  filters.category === category.name
                    ? 'font-semibold text-ink'
                    : 'text-muted',
                )}
              >
                <span className="truncate">{category.name}</span>
                <span className="text-[11px] tabular-nums text-muted">
                  {category.count}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={applyPrice} className="border-t border-line pt-6">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em]">
          Price range
        </h2>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1">
            <label htmlFor={`${id}-min`} className="sr-only">
              Minimum price
            </label>
            <input
              id={`${id}-min`}
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              placeholder="Min"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              className="h-10 w-full border border-line bg-paper px-3 text-sm focus:border-ink focus:outline-none"
            />
          </div>
          <span className="text-muted" aria-hidden="true">
            –
          </span>
          <div className="flex-1">
            <label htmlFor={`${id}-max`} className="sr-only">
              Maximum price
            </label>
            <input
              id={`${id}-max`}
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              placeholder="Max"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              className="h-10 w-full border border-line bg-paper px-3 text-sm focus:border-ink focus:outline-none"
            />
          </div>
        </div>
        {priceError && (
          <p role="alert" className="mt-2 text-xs text-danger">
            {priceError}
          </p>
        )}
        <button
          type="submit"
          className="mt-3 inline-flex h-10 w-full items-center justify-center border border-ink bg-paper text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors hover:bg-ink hover:text-paper"
        >
          Apply price
        </button>
      </form>
    </div>
  )
}

export default FilterSidebar
