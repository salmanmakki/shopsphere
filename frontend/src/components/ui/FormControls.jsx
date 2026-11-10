import { useId } from 'react'
import { cn } from '../../utils/cn'

const fieldBase =
  'w-full border border-line bg-paper px-3 text-sm text-ink transition-colors placeholder:text-muted/70 focus:border-ink focus:outline-none disabled:cursor-not-allowed disabled:bg-surface'

function FieldWrapper({ id, label, error, hint, required, children }) {
  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={id}
          className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted"
        >
          {label}
          {required && <span className="text-danger"> *</span>}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs text-danger">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-xs text-muted">
            {hint}
          </p>
        )
      )}
    </div>
  )
}

export function Input({
  label,
  error,
  hint,
  id,
  required,
  className = '',
  ...props
}) {
  const autoId = useId()
  const inputId = id || autoId

  return (
    <FieldWrapper
      id={inputId}
      label={label}
      error={error}
      hint={hint}
      required={required}
    >
      <input
        id={inputId}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
        }
        className={cn(fieldBase, 'h-11', error && 'border-danger', className)}
        {...props}
      />
    </FieldWrapper>
  )
}

export function Textarea({
  label,
  error,
  hint,
  id,
  required,
  className = '',
  rows = 5,
  ...props
}) {
  const autoId = useId()
  const inputId = id || autoId

  return (
    <FieldWrapper
      id={inputId}
      label={label}
      error={error}
      hint={hint}
      required={required}
    >
      <textarea
        id={inputId}
        rows={rows}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
        }
        className={cn(
          fieldBase,
          'resize-y py-3 leading-relaxed',
          error && 'border-danger',
          className,
        )}
        {...props}
      />
    </FieldWrapper>
  )
}

export function Select({
  label,
  error,
  hint,
  id,
  required,
  className = '',
  children,
  ...props
}) {
  const autoId = useId()
  const inputId = id || autoId

  return (
    <FieldWrapper
      id={inputId}
      label={label}
      error={error}
      hint={hint}
      required={required}
    >
      <select
        id={inputId}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={
          error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
        }
        className={cn(fieldBase, 'h-11', error && 'border-danger', className)}
        {...props}
      >
        {children}
      </select>
    </FieldWrapper>
  )
}
