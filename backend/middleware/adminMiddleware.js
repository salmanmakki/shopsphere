import { ApiError } from '../utils/ApiError.js'

const adminOnly = (req, res, next) => {
  if (!req.user) {
    return next(new ApiError(401, 'Not authenticated. Please sign in.'))
  }

  if (req.user.role !== 'admin') {
    return next(
      new ApiError(403, 'Administrator access is required for this action.'),
    )
  }

  next()
}

export default adminOnly
