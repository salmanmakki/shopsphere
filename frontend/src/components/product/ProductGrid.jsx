import ProductCard from './ProductCard'
import { ProductCardSkeleton } from '../ui/Skeleton'

function ProductGrid({
  products = [],
  loading = false,
  skeletonCount = 4,
  className = '',
}) {
  if (loading) {
    return (
      <div
        className={`grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-6 md:grid-cols-3 xl:grid-cols-4 ${className}`}
        aria-hidden="true"
      >
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  return (
    <div
      className={`grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-6 md:grid-cols-3 xl:grid-cols-4 ${className}`}
    >
      {products.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  )
}

export default ProductGrid
