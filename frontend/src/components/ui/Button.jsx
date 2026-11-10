import { Loader2 } from 'lucide-react'
import { cn } from '../../utils/cn'

const base =
  'inline-flex items-center justify-center gap-2 border font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50'

const variants = {
  primary:
    'border-ink bg-ink text-paper hover:border-accent hover:bg-accent',
  secondary:
    'border-ink bg-transparent text-ink hover:bg-ink hover:text-paper',
  outline:
    'border-line bg-paper text-ink hover:border-ink hover:bg-surface',
  accent: 'border-accent bg-accent text-paper hover:border-ink hover:bg-ink',
  danger: 'border-danger bg-danger text-paper hover:border-ink hover:bg-ink',
  ghost:
    'border-transparent bg-transparent text-ink hover:bg-surface',
}

const sizes = {
  sm: 'h-9 px-4 text-xs',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-7 text-sm',
}

function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  children,
  type = 'button',
  ref,
  ...props
}) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  )
}

export default Button
