import { cn } from '../../utils/cn'

function Skeleton({ className = '' }) {
  return <div className={cn('animate-pulse bg-surface', className)} />
}

export function ProductCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[4/5] w-full border border-line" />
      <div className="pt-4">
        <Skeleton className="h-2.5 w-20" />
        <Skeleton className="mt-3 h-4 w-4/5" />
        <Skeleton className="mt-3 h-4 w-24" />
        <Skeleton className="mt-4 h-10 w-full" />
      </div>
    </div>
  )
}

export function TableRowSkeleton({ columns = 5 }) {
  return (
    <tr className="border-b border-line">
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-4 py-4">
          <Skeleton className="h-4 w-full max-w-32" />
        </td>
      ))}
    </tr>
  )
}

export default Skeleton
