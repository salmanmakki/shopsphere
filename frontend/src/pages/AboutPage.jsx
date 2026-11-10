import { Link } from 'react-router-dom'
import { ArrowRight, Leaf, ShieldCheck, Sparkles } from 'lucide-react'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

const principles = [
  {
    number: '01',
    title: 'Edit, do not accumulate',
    copy: 'We keep the catalogue deliberately small. Every product earns its place by being useful, well made, and genuinely good to live with.',
  },
  {
    number: '02',
    title: 'Know the makers',
    copy: 'We work with small studios and independent makers, ordering in considered quantities so quality is never traded for volume.',
  },
  {
    number: '03',
    title: 'Design for the long term',
    copy: 'Materials are chosen for how they age, not how they photograph. The goal is fewer replacements and more years of use.',
  },
]

const values = [
  {
    icon: Leaf,
    title: 'Low-impact by default',
    copy: 'Recycled packaging, consolidated shipping, and a preference for natural, repairable materials.',
  },
  {
    icon: ShieldCheck,
    title: 'Honest pricing',
    copy: 'No manufactured urgency or inflated reference prices. What you see is what the piece is worth.',
  },
  {
    icon: Sparkles,
    title: 'Small-batch releases',
    copy: 'Collections arrive slowly and intentionally, giving each piece room to be seen and chosen.',
  },
]

function AboutPage() {
  useDocumentTitle('Our story')

  return (
    <div>
      <section className="border-b border-line">
        <div className="container-shop grid gap-10 py-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:py-20">
          <div>
            <p className="eyebrow">Our story</p>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.02] tracking-[-0.04em] sm:text-5xl xl:text-6xl">
              Good design, bought less often.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted">
              ShopSphere began with a simple frustration: it is hard to find
              everyday objects that are well made, fairly priced, and quiet
              enough to live with for years. So we built a store around that
              brief.
            </p>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
              We are a small, independent team with a slow approach to retail.
              The catalogue is edited rather than endless, released in small
              batches, and supported by people who actually use the products.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-px self-start border border-line bg-line">
            <div className="bg-paper p-6 sm:p-8">
              <p className="font-display text-4xl font-extrabold tracking-[-0.03em]">
                2026
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Founded as an independent, editor-led store.
              </p>
            </div>
            <div className="bg-paper p-6 sm:p-8">
              <p className="font-display text-4xl font-extrabold tracking-[-0.03em]">
                30
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Day returns, because buying well should feel safe.
              </p>
            </div>
            <div className="bg-paper p-6 sm:p-8">
              <p className="font-display text-4xl font-extrabold tracking-[-0.03em]">
                48h
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Typical dispatch time for in-stock orders.
              </p>
            </div>
            <div className="bg-paper p-6 sm:p-8">
              <p className="font-display text-4xl font-extrabold tracking-[-0.03em]">
                100%
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Recycled and recyclable packaging.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ink text-paper">
        <div className="container-shop py-14 lg:py-20">
          <div className="max-w-2xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-paper/40">
              How we work
            </p>
            <h2 className="mt-4 font-display text-3xl font-extrabold leading-[1.08] tracking-[-0.03em] sm:text-4xl">
              Three principles behind every decision.
            </h2>
          </div>

          <div className="mt-10 grid gap-px bg-paper/15 lg:grid-cols-3">
            {principles.map((principle) => (
              <div key={principle.number} className="bg-ink p-6 lg:p-8">
                <p className="text-[11px] font-semibold tracking-[0.18em] text-paper/35">
                  {principle.number}
                </p>
                <h3 className="mt-4 font-display text-lg font-bold tracking-tight">
                  {principle.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-paper/60">
                  {principle.copy}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-shop py-14 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="eyebrow">What we value</p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.03em]">
              Quietly better, on purpose.
            </h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-3">
            {values.map((value) => {
              const Icon = value.icon
              return (
                <div key={value.title}>
                  <span className="flex size-10 items-center justify-center border border-line bg-surface">
                    <Icon className="size-4 text-accent" aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-display text-sm font-bold tracking-tight">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {value.copy}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="container-shop pb-16 lg:pb-24">
        <div className="flex flex-col items-start justify-between gap-6 border border-line bg-surface/60 p-8 sm:flex-row sm:items-center sm:p-10">
          <div>
            <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
              Find something worth keeping.
            </h2>
            <p className="mt-2 text-sm text-muted">
              Browse the current collection — small, considered, and ready to
              ship.
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex h-11 shrink-0 items-center gap-2 border border-ink bg-ink px-6 text-sm font-semibold text-paper transition-colors hover:border-accent hover:bg-accent"
          >
            Shop the collection
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  )
}

export default AboutPage
