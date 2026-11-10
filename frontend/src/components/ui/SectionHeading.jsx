function SectionHeading({ eyebrow, title, description, action, className = '' }) {
  return (
    <div
      className={`flex flex-col gap-5 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between ${className}`}
    >
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.02em] sm:text-4xl">
          {title}
        </h2>
        {description && (
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export default SectionHeading
