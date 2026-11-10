import { body, query } from 'express-validator'
import { sortValues } from '../utils/buildProductQuery.js'

const nameRule = body('name')
  .trim()
  .notEmpty()
  .withMessage('Product name is required')
  .isLength({ max: 140 })
  .withMessage('Product name cannot exceed 140 characters')

const descriptionRule = body('description')
  .optional({ values: 'falsy' })
  .isString()
  .withMessage('Description must be text')
  .trim()
  .isLength({ max: 5000 })
  .withMessage('Description cannot exceed 5000 characters')

const categoryRule = body('category')
  .trim()
  .notEmpty()
  .withMessage('Category is required')
  .isLength({ max: 60 })
  .withMessage('Category cannot exceed 60 characters')

const priceRule = body('price')
  .notEmpty()
  .withMessage('Price is required')
  .isFloat({ min: 0 })
  .withMessage('Price must be a number greater than or equal to 0')
  .toFloat()

const originalPriceRule = body('originalPrice')
  .optional({ values: 'falsy' })
  .isFloat({ min: 0 })
  .withMessage('Original price must be a number greater than or equal to 0')
  .toFloat()
  .custom((value, { req }) => {
    if (value == null || value === '') return true
    return Number(value) >= Number(req.body.price)
  })
  .withMessage('Original price must be greater than or equal to the price')

const imageRule = body('image')
  .optional({ values: 'falsy' })
  .isString()
  .withMessage('Image must be a URL string')
  .trim()
  .isURL({ protocols: ['http', 'https'], require_protocol: true })
  .withMessage('Image must be a valid http(s) URL')

const stockRule = body('stock')
  .optional()
  .isInt({ min: 0 })
  .withMessage('Stock must be a whole number greater than or equal to 0')
  .toInt()

const booleanRule = (field) =>
  body(field)
    .optional()
    .isBoolean()
    .withMessage(`${field} must be true or false`)
    .toBoolean()

export const createProductValidators = [
  nameRule,
  descriptionRule,
  categoryRule,
  priceRule,
  originalPriceRule,
  imageRule,
  stockRule,
  booleanRule('isFeatured'),
  booleanRule('isBestSeller'),
]

export const updateProductValidators = createProductValidators

export const productQueryValidators = [
  query('search')
    .optional({ values: 'falsy' })
    .isString()
    .trim()
    .isLength({ max: 100 }),
  query('category')
    .optional({ values: 'falsy' })
    .isString()
    .trim()
    .isLength({ max: 60 }),
  query('minPrice')
    .optional({ values: 'falsy' })
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number')
    .toFloat(),
  query('maxPrice')
    .optional({ values: 'falsy' })
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number')
    .toFloat(),
  query('sort')
    .optional({ values: 'falsy' })
    .isIn(sortValues)
    .withMessage('Invalid sort option'),
  query('featured')
    .optional({ values: 'falsy' })
    .isIn(['true', 'false'])
    .withMessage('featured must be true or false'),
  query('bestSeller')
    .optional({ values: 'falsy' })
    .isIn(['true', 'false'])
    .withMessage('bestSeller must be true or false'),
  query('page').optional({ values: 'falsy' }).isInt({ min: 1 }).toInt(),
  query('limit')
    .optional({ values: 'falsy' })
    .isInt({ min: 1, max: 60 })
    .toInt(),
]
