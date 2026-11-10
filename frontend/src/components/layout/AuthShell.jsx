import { Link } from 'react-router-dom'
import { ArrowLeft, Check } from 'lucide-react'
import Logo from '../ui/Logo'

const CURRENT_YEAR = new Date().getFullYear()

const benefits = [
  'A curated catalogue of useful, beautiful goods',
  'Secure checkout with encrypted payments',
  'Order history and faster checkout for members',
]

function AuthShell({ eyebrow, title, description, children, footer }) {
  return (
    <div className="grid min-h-screen bg-paper lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-ink p-12 text-paper lg:flex xl:p-16">
        <div className="flex items-center justify-between">
          <Logo light />
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-paper/35">
            Est. 2026
          </span>
        </div>

        <div className="relative z-10 max-w-lg">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-paper/40">
            ShopSphere membership
          </p>
          <p className="mt-6 font-display text-4xl font-extrabold leading-[1.08] tracking-[-0.03em] xl:text-5xl">
            Considered goods for a slower, better everyday.
          </p>
          <ul className="mt-10 space-y-4 border-t border-paper/15 pt-8">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center border border-paper/25">
                  <Check className="size-3" aria-hidden="true" />
                </span>
                <span className="text-sm leading-relaxed text-paper/65">
                  {benefit}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-[10px] font-medium uppercase tracking-[0.16em] text-paper/30">
          Thoughtful goods, made to last
        </p>

        <div
          aria-hidden="true"
          className="absolute -right-16 top-1/2 size-80 -translate-y-1/2 border border-paper/10"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-24 -left-24 size-72 border border-paper/10"
        />
      </aside>

      <main className="flex flex-col px-5 py-8 sm:px-10 lg:px-14 xl:px-20">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted transition-colors hover:text-ink"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            Back to store
          </Link>
          <div className="lg:hidden">
            <Logo />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center py-12">
          <div className="w-full max-w-md">
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h1 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.02em] sm:text-4xl">
              {title}
            </h1>
            {description && (
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {description}
              </p>
            )}

            <div className="mt-8">{children}</div>

            {footer && (
              <div className="mt-8 border-t border-line pt-6 text-sm text-muted">
                {footer}
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-[10px] uppercase tracking-[0.16em] text-muted/70 lg:text-left">
          © {CURRENT_YEAR} ShopSphere
        </p>
      </main>
    </div>
  )
}

export default AuthShell
