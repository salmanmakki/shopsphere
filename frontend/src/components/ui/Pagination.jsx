import { ChevronLeft, ChevronRight } from 'lucide-react'

function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null

  return (
    <nav
      className="mt-12 flex items-center justify-between border-t border-line pt-6"
      aria-label="Pagination"
    >
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="inline-flex h-10 items-center gap-2 border border-line px-4 text-xs font-semibold uppercase tracking-[0.12em] transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        Previous
      </button>

      <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
        Page {page} of {totalPages}
      </span>

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="inline-flex h-10 items-center gap-2 border border-line px-4 text-xs font-semibold uppercase tracking-[0.12em] transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
        <ChevronRight className="size-4" aria-hidden="true" />
      </button>
    </nav>
  )
}

export default Pagination
