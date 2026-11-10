import { Loader2 } from 'lucide-react'

function PageLoader({ label = 'Loading' }) {
  return (
    <div
      className="flex min-h-[60vh] flex-col items-center justify-center gap-4"
      role="status"
      aria-live="polite"
    >
      <Loader2 className="size-6 animate-spin text-accent" aria-hidden="true" />
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
        {label}
      </span>
    </div>
  )
}

export default PageLoader
