import { v2 as cloudinary } from 'cloudinary'
import { env } from '../config/env.js'
import { ApiError } from './ApiError.js'

const { cloudName, apiKey, apiSecret, folder } = env.cloudinary

export const isCloudinaryConfigured = Boolean(cloudName && apiKey && apiSecret)

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  })
}

export const uploadProductImage = (buffer) => {
  if (!isCloudinaryConfigured) {
    throw new ApiError(
      503,
      'Image uploads are not configured. Add Cloudinary credentials to the server environment.',
    )
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { width: 1600, height: 2000, crop: 'limit' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) {
          return reject(new ApiError(502, 'Image upload failed. Please try again.'))
        }
        return resolve({
          url: result.secure_url,
          publicId: result.public_id,
        })
      },
    )

    stream.end(buffer)
  })
}
