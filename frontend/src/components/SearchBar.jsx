import { Search, X } from 'lucide-react'

function SearchBar({ value, onChange, onClear, placeholder = 'Search products' }) {
  return (
    <div className="relative">
      <Search
        className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted"
        aria-hidden="true"
      />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label="Search products"
        className="h-12 w-full border border-line bg-paper pl-11 pr-11 text-sm text-ink transition-colors placeholder:text-muted/70 focus:border-ink focus:outline-none"
      />
      {value && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className="absolute right-3 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center text-muted transition-colors hover:text-ink"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

export default SearchBar
