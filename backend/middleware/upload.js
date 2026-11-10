import multer from 'multer'
import { ApiError } from '../utils/ApiError.js'

const storage = multer.memoryStorage()

const fileFilter = (req, file, callback) => {
  if (!file.mimetype.startsWith('image/')) {
    return callback(new ApiError(400, 'Only image files can be uploaded'))
  }
  return callback(null, true)
}

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter,
})
