import { Router } from 'express'
import {
  createProduct,
  deleteProduct,
  getAdminProducts,
  getDashboard,
  updateProduct,
  uploadImage,
} from '../controllers/adminController.js'
import { protect } from '../middleware/authMiddleware.js'
import adminOnly from '../middleware/adminMiddleware.js'
import validate from '../middleware/validate.js'
import validateObjectId from '../middleware/validateObjectId.js'
import { upload } from '../middleware/upload.js'
import {
  createProductValidators,
  productQueryValidators,
  updateProductValidators,
} from '../validators/productValidators.js'

const router = Router()

router.use(protect, adminOnly)

router.get('/dashboard', getDashboard)
router.get('/products', productQueryValidators, validate, getAdminProducts)
router.post('/products', createProductValidators, validate, createProduct)
router.put(
  '/products/:id',
  validateObjectId('id'),
  updateProductValidators,
  validate,
  updateProduct,
)
router.delete(
  '/products/:id',
  validateObjectId('id'),
  validate,
  deleteProduct,
)
router.post('/upload', upload.single('image'), uploadImage)

export default router
