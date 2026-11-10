function EmptyState({ icon: Icon, title, description, children, className = '' }) {
  return (
    <div
      className={`flex flex-col items-center justify-center border border-line bg-surface/60 px-6 py-16 text-center ${className}`}
    >
      {Icon && (
        <span className="flex size-14 items-center justify-center border border-line bg-paper">
          <Icon className="size-6 text-muted" aria-hidden="true" />
        </span>
      )}
      <h2 className="mt-6 font-display text-xl font-bold tracking-tight">
        {title}
      </h2>
      {description && (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
          {description}
        </p>
      )}
      {children && <div className="mt-6">{children}</div>}
    </div>
  )
}

export default EmptyState
