import User from '../models/User.js'
import { env } from '../config/env.js'
import { verifyToken } from '../utils/token.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.[env.cookieName]

  if (!token) {
    throw new ApiError(401, 'Not authenticated. Please sign in.')
  }

  let payload
  try {
    payload = verifyToken(token)
  } catch {
    throw new ApiError(401, 'Your session has expired. Please sign in again.')
  }

  const user = await User.findById(payload.sub)

  if (!user) {
    throw new ApiError(401, 'The account for this session no longer exists.')
  }

  req.user = user
  next()
})
