import { Minus, Plus } from 'lucide-react'

function QuantitySelector({
  value,
  onChange,
  max = 99,
  min = 1,
  disabled = false,
  className = '',
}) {
  const decrease = () => onChange(Math.max(min, value - 1))
  const increase = () => onChange(Math.min(max, value + 1))

  return (
    <div
      className={`inline-flex h-11 items-center border border-line bg-paper ${className}`}
    >
      <button
        type="button"
        onClick={decrease}
        disabled={disabled || value <= min}
        aria-label="Decrease quantity"
        className="flex h-full w-10 items-center justify-center transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Minus className="size-3.5" aria-hidden="true" />
      </button>
      <span
        className="flex h-full w-10 items-center justify-center border-x border-line text-sm font-semibold"
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={increase}
        disabled={disabled || value >= max}
        aria-label="Increase quantity"
        className="flex h-full w-10 items-center justify-center transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  )
}

export default QuantitySelector
