import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, RotateCcw, ShieldCheck, Truck } from 'lucide-react'
import ProductGrid from '../components/product/ProductGrid'
import SectionHeading from '../components/ui/SectionHeading'
import { getCategories, getProducts } from '../services/productService'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { PLACEHOLDER_IMAGE } from '../utils/constants'

const fallbackCategories = ['Apparel', 'Accessories', 'Home', 'Footwear']

const values = [
  {
    icon: ShieldCheck,
    title: 'Considered quality',
    copy: 'Every piece is chosen for material, function, and longevity — not trends.',
  },
  {
    icon: Truck,
    title: 'Carbon-neutral delivery',
    copy: 'Orders ship in recycled packaging, with emissions offset on every parcel.',
  },
  {
    icon: RotateCcw,
    title: '30-day returns',
    copy: 'Take your time. If it is not right for you, send it back within thirty days.',
  },
]

function HomePage() {
  useDocumentTitle('Considered goods for everyday living')

  const [categories, setCategories] = useState([])
  const [featured, setFeatured] = useState([])
  const [bestSellers, setBestSellers] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    const load = async () => {
      const results = await Promise.allSettled([
        getCategories({ signal: controller.signal }),
        getProducts({ featured: true, limit: 4 }, { signal: controller.signal }),
        getProducts(
          { bestSeller: true, limit: 4 },
          { signal: controller.signal },
        ),
        getProducts(
          { sort: 'newest', limit: 4 },
          { signal: controller.signal },
        ),
      ])

      if (controller.signal.aborted) return

      const [categoryResult, featuredResult, bestSellerResult, newResult] =
        results

      if (categoryResult.status === 'fulfilled') {
        setCategories(categoryResult.value.data || [])
      }
      if (featuredResult.status === 'fulfilled') {
        setFeatured(featuredResult.value.data || [])
      }
      if (bestSellerResult.status === 'fulfilled') {
        setBestSellers(bestSellerResult.value.data || [])
      }
      if (newResult.status === 'fulfilled') {
        setNewArrivals(newResult.value.data || [])
      }

      setFailed(
        featuredResult.status === 'rejected' &&
          newResult.status === 'rejected',
      )
      setLoading(false)
    }

    load()

    return () => controller.abort()
  }, [])

  const heroProduct = featured[0] || newArrivals[0] || null
  const categoryNames =
    categories.length > 0 ? categories.map((category) => category.name) : fallbackCategories

  return (
    <div>
      <section className="border-b border-line">
        <div className="container-shop grid items-stretch gap-10 py-12 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:py-16">
          <div className="flex flex-col justify-center">
            <p className="eyebrow">The ShopSphere edit — 2026</p>
            <h1 className="mt-5 font-display text-5xl font-extrabold leading-[0.98] tracking-[-0.04em] sm:text-6xl xl:text-7xl">
              Objects for a slower, better everyday.
            </h1>
            <p className="mt-7 max-w-lg text-base leading-relaxed text-muted">
              A tightly edited collection of apparel, accessories, and homeware.
              Useful, beautiful, and built to be kept — not replaced.
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="inline-flex h-12 items-center gap-2 border border-ink bg-ink px-7 text-sm font-semibold text-paper transition-colors hover:border-accent hover:bg-accent"
              >
                Shop the collection
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                to="/shop?bestSeller=true"
                className="inline-flex h-12 items-center border border-line px-7 text-sm font-semibold transition-colors hover:border-ink"
              >
                Best sellers
              </Link>
            </div>

            <dl className="mt-12 grid max-w-lg grid-cols-3 border-t border-line pt-6">
              <div>
                <dt className="text-[10px] uppercase tracking-[0.14em] text-muted">
                  Free shipping
                </dt>
                <dd className="mt-1.5 text-sm font-semibold">Over $150</dd>
              </div>
              <div className="border-l border-line pl-5">
                <dt className="text-[10px] uppercase tracking-[0.14em] text-muted">
                  Returns
                </dt>
                <dd className="mt-1.5 text-sm font-semibold">30 days</dd>
              </div>
              <div className="border-l border-line pl-5">
                <dt className="text-[10px] uppercase tracking-[0.14em] text-muted">
                  Support
                </dt>
                <dd className="mt-1.5 text-sm font-semibold">Mon–Fri</dd>
              </div>
            </dl>
          </div>

          <div className="relative min-h-[320px] lg:min-h-[520px]">
            {heroProduct ? (
              <Link
                to={`/product/${heroProduct._id}`}
                className="group relative block h-full min-h-[320px] overflow-hidden border border-line bg-surface lg:min-h-[520px]"
              >
                <img
                  src={heroProduct.image || PLACEHOLDER_IMAGE}
                  alt={heroProduct.name}
                  onError={(event) => {
                    event.currentTarget.src = PLACEHOLDER_IMAGE
                  }}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-ink/80 p-5 text-paper">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-paper/60">
                      Featured piece
                    </p>
                    <p className="mt-1 font-display text-lg font-bold tracking-tight">
                      {heroProduct.name}
                    </p>
                  </div>
                  <span className="flex size-10 shrink-0 items-center justify-center border border-paper/30">
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ) : (
              <div className="flex h-full min-h-[320px] flex-col justify-between border border-line bg-ink p-8 text-paper lg:min-h-[520px]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-paper/40">
                    The edit
                  </span>
                  <span className="size-2 bg-paper" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-display text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] xl:text-5xl">
                    Fewer, better things.
                  </p>
                  <p className="mt-4 max-w-sm text-sm leading-relaxed text-paper/60">
                    Our shelves are stocked slowly and deliberately. Explore the
                    full collection when you are ready.
                  </p>
                  <Link
                    to="/shop"
                    className="mt-6 inline-flex items-center gap-2 border-b border-paper/40 pb-1 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors hover:border-paper"
                  >
                    Browse all products
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="border-b border-line">
        <div className="container-shop grid grid-cols-2 gap-x-6 gap-y-4 py-6 sm:grid-cols-4">
          {categoryNames.slice(0, 4).map((name, index) => (
            <Link
              key={name}
              to={`/shop?category=${encodeURIComponent(name)}`}
              className="group flex items-center justify-between border-b border-line py-2 text-sm transition-colors hover:text-accent"
            >
              <span>
                <span className="mr-3 text-[10px] tabular-nums text-muted">
                  0{index + 1}
                </span>
                {name}
              </span>
              <ArrowUpRight
                className="size-3.5 text-muted transition-colors group-hover:text-accent"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      </section>

      <section className="container-shop pt-16 lg:pt-20">
        <SectionHeading
          eyebrow="Curated selection"
          title="Featured this season"
          description="Pieces our team is living with right now — chosen for form, function, and the way they age."
          action={
            <Link
              to="/shop"
              className="inline-flex h-10 items-center gap-2 border border-line px-4 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors hover:border-ink"
            >
              View all
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          }
        />

        <div className="pt-8">
          {loading ? (
            <ProductGrid loading skeletonCount={4} />
          ) : featured.length > 0 ? (
            <ProductGrid products={featured} />
          ) : (
            <div className="border border-line bg-surface/60 px-6 py-10 text-center">
              <p className="text-sm text-muted">
                {failed
                  ? 'The collection could not be loaded right now. Please try again shortly.'
                  : 'Featured pieces are being curated. Explore the full shop in the meantime.'}
              </p>
              <Link
                to="/shop"
                className="mt-4 inline-flex h-10 items-center border border-ink px-5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors hover:bg-ink hover:text-paper"
              >
                Browse the collection
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="container-shop pt-16 lg:pt-24">
        <div className="grid gap-8 border-y border-line py-12 lg:grid-cols-3 lg:gap-10">
          {values.map((value) => {
            const Icon = value.icon
            return (
              <div key={value.title} className="flex gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center border border-line bg-surface">
                  <Icon className="size-5 text-accent" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-display text-sm font-bold tracking-tight">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {value.copy}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="container-shop pt-16 lg:pt-24">
        <SectionHeading
          eyebrow="Most loved"
          title="Best sellers"
          description="The pieces that keep coming back — quietly popular, consistently good."
          action={
            <Link
              to="/shop?bestSeller=true"
              className="inline-flex h-10 items-center gap-2 border border-line px-4 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors hover:border-ink"
            >
              Shop best sellers
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          }
        />
        <div className="pt-8">
          {bestSellers.length > 0 ? (
            <ProductGrid products={bestSellers} />
          ) : (
            <div className="border border-line bg-surface/60 px-6 py-10 text-center text-sm text-muted">
              Best sellers will appear here as the collection grows.
            </div>
          )}
        </div>
      </section>

      <section className="container-shop pt-16 lg:pt-24">
        <div className="grid items-center gap-0 border border-line lg:grid-cols-2">
          <div className="bg-ink p-8 text-paper sm:p-12 lg:p-14">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-paper/40">
              Our promise
            </p>
            <p className="mt-5 font-display text-3xl font-extrabold leading-[1.08] tracking-[-0.03em] sm:text-4xl">
              Buy less. Choose well. Make it last.
            </p>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-paper/60">
              ShopSphere exists to make good design accessible without
              encouraging waste. We work with small makers, order in considered
              quantities, and keep the catalogue intentionally small.
            </p>
            <Link
              to="/about"
              className="mt-7 inline-flex items-center gap-2 border-b border-paper/40 pb-1 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors hover:border-paper"
            >
              Read our story
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-px bg-line">
            <div className="bg-paper p-8 sm:p-10">
              <p className="font-display text-4xl font-extrabold tracking-[-0.03em]">
                48h
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Dispatch on in-stock orders, Monday to Friday.
              </p>
            </div>
            <div className="bg-paper p-8 sm:p-10">
              <p className="font-display text-4xl font-extrabold tracking-[-0.03em]">
                30
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Days to return anything that is not quite right.
              </p>
            </div>
            <div className="bg-paper p-8 sm:p-10">
              <p className="font-display text-4xl font-extrabold tracking-[-0.03em]">
                100%
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Recycled and recyclable packaging on every order.
              </p>
            </div>
            <div className="bg-paper p-8 sm:p-10">
              <p className="font-display text-4xl font-extrabold tracking-[-0.03em]">
                01
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                Small-batch collections, released slowly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {newArrivals.length > 0 && (
        <section className="container-shop pt-16 lg:pt-24">
          <SectionHeading
            eyebrow="Just landed"
            title="New arrivals"
            action={
              <Link
                to="/shop?sort=newest"
                className="inline-flex h-10 items-center gap-2 border border-line px-4 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors hover:border-ink"
              >
                See what is new
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            }
          />
          <div className="pt-8">
            <ProductGrid products={newArrivals} />
          </div>
        </section>
      )}
    </div>
  )
}

export default HomePage
