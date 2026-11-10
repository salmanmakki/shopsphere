import { Router } from 'express'
import {
  getCategories,
  getProductById,
  getProducts,
} from '../controllers/productController.js'
import validate from '../middleware/validate.js'
import validateObjectId from '../middleware/validateObjectId.js'
import { productQueryValidators } from '../validators/productValidators.js'

const router = Router()

router.get('/', productQueryValidators, validate, getProducts)
router.get('/categories', getCategories)
router.get('/:id', validateObjectId('id'), getProductById)

export default router
