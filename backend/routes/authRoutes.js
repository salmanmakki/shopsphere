import { Router } from 'express'
import {
  getMe,
  login,
  logout,
  register,
  registerAdmin,
} from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'
import { authLimiter } from '../middleware/rateLimiters.js'
import validate from '../middleware/validate.js'
import {
  adminRegisterValidators,
  loginValidators,
  registerValidators,
} from '../validators/authValidators.js'

const router = Router()

router.post('/register', authLimiter, registerValidators, validate, register)
router.post(
  '/admin/register',
  authLimiter,
  adminRegisterValidators,
  validate,
  registerAdmin,
)
router.post('/login', authLimiter, loginValidators, validate, login)
router.post('/logout', logout)
router.get('/me', protect, getMe)

export default router
