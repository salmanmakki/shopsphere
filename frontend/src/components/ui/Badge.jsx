import { cn } from '../../utils/cn'

const variants = {
  neutral: 'border-line bg-paper text-muted',
  success: 'border-success/25 bg-success/5 text-success',
  accent: 'border-accent/25 bg-accent/5 text-accent',
  danger: 'border-danger/25 bg-danger/5 text-danger',
  dark: 'border-ink bg-ink text-paper',
}

function Badge({ variant = 'neutral', className = '', children }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}

export default Badge
