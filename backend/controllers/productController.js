import Product from '../models/Product.js'
import { env } from '../config/env.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { buildProductQuery } from '../utils/buildProductQuery.js'

export const getProducts = asyncHandler(async (req, res) => {
  const { filter, sort, page, limit, skip } = buildProductQuery(req.query)

  const [products, total] = await Promise.all([
    Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-__v')
      .lean(),
    Product.countDocuments(filter),
  ])

  const totalPages = total === 0 ? 0 : Math.ceil(total / limit)

  res.json({
    success: true,
    data: products,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  })
})

export const getCategories = asyncHandler(async (req, res) => {
  const threshold = env.lowStockThreshold

  const categories = await Product.aggregate([
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        image: { $first: '$image' },
        inStock: {
          $sum: { $cond: [{ $gt: ['$stock', threshold] }, 1, 0] },
        },
        lowStock: {
          $sum: {
            $cond: [
              {
                $and: [{ $gt: ['$stock', 0] }, { $lte: ['$stock', threshold] }],
              },
              1,
              0,
            ],
          },
        },
        outOfStock: {
          $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] },
        },
      },
    },
    {
      $project: {
        _id: 0,
        name: '$_id',
        count: 1,
        image: 1,
        inStock: 1,
        lowStock: 1,
        outOfStock: 1,
      },
    },
    { $sort: { name: 1 } },
  ])

  res.json({ success: true, data: categories })
})

export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).select('-__v').lean()

  if (!product) {
    throw new ApiError(404, 'Product not found.')
  }

  res.json({ success: true, data: product })
})
