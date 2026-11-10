import Product from '../models/Product.js'
import { env } from '../config/env.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { buildProductQuery } from '../utils/buildProductQuery.js'
import {
  isCloudinaryConfigured,
  uploadProductImage,
} from '../utils/cloudinary.js'

const buildProductPayload = (body) => {
  const price = Number(body.price)

  return {
    name: body.name,
    description: body.description || '',
    category: body.category,
    price,
    originalPrice:
      body.originalPrice === '' ||
      body.originalPrice === null ||
      body.originalPrice === undefined
        ? null
        : Number(body.originalPrice),
    image: body.image || '',
    stock: body.stock === undefined ? 0 : Number(body.stock),
    isFeatured: Boolean(body.isFeatured),
    isBestSeller: Boolean(body.isBestSeller),
  }
}

export const getDashboard = asyncHandler(async (req, res) => {
  const threshold = env.lowStockThreshold

  const [totalProducts, categories, stockAggregation, recentProducts] =
    await Promise.all([
      Product.countDocuments(),
      Product.distinct('category'),
      Product.aggregate([
        {
          $group: {
            _id: null,
            totalStock: { $sum: '$stock' },
            inStock: {
              $sum: { $cond: [{ $gt: ['$stock', threshold] }, 1, 0] },
            },
            lowStock: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gt: ['$stock', 0] },
                      { $lte: ['$stock', threshold] },
                    ],
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
      ]),
      Product.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name category price stock image isFeatured isBestSeller')
        .lean(),
    ])

  const aggregate = stockAggregation[0] || {
    totalStock: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
  }

  res.json({
    success: true,
    data: {
      stats: {
        totalProducts,
        totalCategories: categories.length,
        inStock: aggregate.inStock,
        lowStock: aggregate.lowStock,
        outOfStock: aggregate.outOfStock,
        totalStock: aggregate.totalStock,
      },
      recentProducts,
      lowStockThreshold: threshold,
    },
  })
})

export const getAdminProducts = asyncHandler(async (req, res) => {
  const { filter, sort, page, limit, skip } = buildProductQuery(req.query, {
    defaultLimit: 20,
  })

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
    meta: { page, limit, total, totalPages },
  })
})

export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(buildProductPayload(req.body))

  res.status(201).json({
    success: true,
    message: 'Product created successfully.',
    data: product,
  })
})

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    buildProductPayload(req.body),
    { returnDocument: 'after', runValidators: true },
  ).select('-__v')

  if (!product) {
    throw new ApiError(404, 'Product not found.')
  }

  res.json({
    success: true,
    message: 'Product updated successfully.',
    data: product,
  })
})

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id)

  if (!product) {
    throw new ApiError(404, 'Product not found.')
  }

  res.json({ success: true, message: 'Product deleted successfully.' })
})

export const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Please select an image to upload.')
  }

  if (!isCloudinaryConfigured) {
    throw new ApiError(
      503,
      'Image uploads are not configured on this server. You can still paste an image URL.',
    )
  }

  const result = await uploadProductImage(req.file.buffer)

  res.status(201).json({
    success: true,
    message: 'Image uploaded successfully.',
    data: result,
  })
})
