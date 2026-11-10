import User from '../models/User.js'
import { env } from '../config/env.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { signToken } from '../utils/token.js'
import { setAuthCookie, clearAuthCookie } from '../utils/cookie.js'

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body

  const existingUser = await User.findOne({ email })
  if (existingUser) {
    throw new ApiError(409, 'An account with this email already exists.')
  }

  const user = await User.create({
    name,
    email,
    password,
    role: 'customer',
  })

  setAuthCookie(res, signToken(user))

  res.status(201).json({
    success: true,
    message: 'Account created successfully.',
    user,
  })
})

export const registerAdmin = asyncHandler(async (req, res) => {
  if (!env.allowAdminRegistration) {
    throw new ApiError(
      403,
      'Administrator registration is disabled. Use the admin seed script to create an account.',
    )
  }

  const { name, email, password } = req.body

  const existingUser = await User.findOne({ email })
  if (existingUser) {
    throw new ApiError(409, 'An account with this email already exists.')
  }

  const user = await User.create({
    name,
    email,
    password,
    role: 'admin',
  })

  setAuthCookie(res, signToken(user))

  res.status(201).json({
    success: true,
    message: 'Administrator account created successfully.',
    user,
  })
})

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email }).select('+password')

  if (!user || !(await user.matchPassword(password))) {
    throw new ApiError(401, 'Invalid email or password.')
  }

  setAuthCookie(res, signToken(user))

  res.json({
    success: true,
    message: 'Signed in successfully.',
    user,
  })
})

export const logout = asyncHandler(async (req, res) => {
  clearAuthCookie(res)
  res.json({ success: true, message: 'Signed out successfully.' })
})

export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user })
})
