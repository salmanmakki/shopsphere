import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn'

function Logo({ light = false, className = '' }) {
  return (
    <Link
      to="/"
      className={cn('inline-flex items-center gap-2.5', className)}
      aria-label="ShopSphere home"
    >
      <span
        className={cn(
          'size-2.5',
          light ? 'border border-paper bg-paper' : 'bg-accent',
        )}
        aria-hidden="true"
      />
      <span
        className={cn(
          'font-display text-lg font-extrabold tracking-tight',
          light ? 'text-paper' : 'text-ink',
        )}
      >
        Shop
        <span className={light ? 'text-paper/60' : 'text-accent'}>Sphere</span>
      </span>
    </Link>
  )
}

export default Logo
