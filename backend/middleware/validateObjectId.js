import mongoose from 'mongoose'
import { ApiError } from '../utils/ApiError.js'

const validateObjectId = (paramName = 'id') => (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params[paramName])) {
    return next(new ApiError(400, `Invalid ${paramName}`))
  }
  return next()
}

export default validateObjectId
