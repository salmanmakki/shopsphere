import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

function NotFoundPage() {
  useDocumentTitle('Page not found')

  return (
    <div className="container-shop py-16 lg:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-display text-[7rem] font-extrabold leading-none tracking-[-0.06em] sm:text-[10rem]">
          404
        </p>
        <p className="eyebrow mt-4">Off the map</p>
        <h1 className="mt-3 font-display text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl">
          This page could not be found.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted">
          The link may be broken, or the page may have moved. Return to the
          storefront or browse the current collection.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="inline-flex h-11 items-center border border-ink bg-ink px-6 text-sm font-semibold text-paper transition-colors hover:border-accent hover:bg-accent"
          >
            Back home
          </Link>
          <Link
            to="/shop"
            className="inline-flex h-11 items-center gap-2 border border-line px-6 text-sm font-semibold transition-colors hover:border-ink"
          >
            Browse products
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
