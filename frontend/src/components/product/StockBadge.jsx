import { getStockLabel, getStockStatus } from '../../utils/format'
import { cn } from '../../utils/cn'

const dotColors = {
  in: 'bg-success',
  low: 'bg-accent',
  out: 'bg-danger',
}

const textColors = {
  in: 'text-muted',
  low: 'text-accent',
  out: 'text-danger',
}

function StockBadge({ stock, threshold, className = '' }) {
  const status = getStockStatus(stock, threshold)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-[11px] font-medium',
        textColors[status],
        className,
      )}
    >
      <span className={cn('size-1.5', dotColors[status])} aria-hidden="true" />
      {getStockLabel(stock, threshold)}
    </span>
  )
}

export default StockBadge
