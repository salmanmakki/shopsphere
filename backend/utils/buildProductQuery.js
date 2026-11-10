import { ApiError } from './ApiError.js'

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const sortOptions = {
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  newest: { createdAt: -1 },
  name_asc: { name: 1 },
}

export const sortValues = Object.keys(sortOptions)

export const buildProductQuery = (query = {}, options = {}) => {
  const { defaultLimit = 12, maxLimit = 60 } = options

  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1)
  const requestedLimit = Number.parseInt(query.limit, 10) || defaultLimit
  const limit = Math.min(Math.max(requestedLimit, 1), maxLimit)

  const filter = {}

  const search = typeof query.search === 'string' ? query.search.trim() : ''
  if (search) {
    filter.name = { $regex: escapeRegex(search), $options: 'i' }
  }

  const category =
    typeof query.category === 'string' ? query.category.trim() : ''
  if (category) {
    filter.category = {
      $regex: `^${escapeRegex(category)}$`,
      $options: 'i',
    }
  }

  if (query.featured === 'true') filter.isFeatured = true
  if (query.featured === 'false') filter.isFeatured = false
  if (query.bestSeller === 'true') filter.isBestSeller = true
  if (query.bestSeller === 'false') filter.isBestSeller = false

  const minPrice = query.minPrice === '' ? NaN : Number(query.minPrice)
  const maxPrice = query.maxPrice === '' ? NaN : Number(query.maxPrice)

  if (Number.isFinite(minPrice) || Number.isFinite(maxPrice)) {
    if (Number.isFinite(minPrice) && Number.isFinite(maxPrice)) {
      if (minPrice > maxPrice) {
        throw new ApiError(400, 'Minimum price cannot be greater than maximum price')
      }
    }
    filter.price = {}
    if (Number.isFinite(minPrice)) filter.price.$gte = minPrice
    if (Number.isFinite(maxPrice)) filter.price.$lte = maxPrice
  }

  return {
    filter,
    sort: sortOptions[query.sort] || sortOptions.newest,
    page,
    limit,
    skip: (page - 1) * limit,
  }
}
