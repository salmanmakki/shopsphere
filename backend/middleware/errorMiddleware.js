import multer from 'multer'

const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err)
  }

  let statusCode = err.statusCode || 500
  let message = err.message || 'Something went wrong on the server'
  let errors = err.errors

  if (err instanceof multer.MulterError) {
    statusCode = 400
    message =
      err.code === 'LIMIT_FILE_SIZE'
        ? 'Image is too large. Maximum size is 5 MB.'
        : 'Image upload failed.'
  } else if (err.name === 'CastError') {
    statusCode = 400
    message = `Invalid value for ${err.path}`
  } else if (err.name === 'ValidationError') {
    statusCode = 422
    message = 'Validation failed'
    errors = Object.values(err.errors).map((error) => ({
      field: error.path,
      message: error.message,
    }))
  } else if (err.code === 11000) {
    statusCode = 409
    const field = Object.keys(err.keyPattern || {})[0] || 'field'
    message = `A record with that ${field} already exists`
  } else if (err.type === 'entity.parse.failed') {
    statusCode = 400
    message = 'Malformed JSON in request body'
  } else if (err.message === 'Origin not allowed by CORS') {
    statusCode = 403
    message = 'This origin is not allowed to access the API'
  }

  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    console.error(err)
    message = 'Something went wrong on the server'
  } else if (statusCode >= 500) {
    console.error(err)
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

export default errorHandler
