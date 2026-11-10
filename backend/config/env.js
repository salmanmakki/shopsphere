import 'dotenv/config'

const requiredVariables = ['MONGO_URI', 'JWT_SECRET']
const missing = requiredVariables.filter((key) => !process.env[key])

if (missing.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missing.join(', ')}. Copy .env.example to .env and fill in the values.`,
  )
}

const nodeEnv = process.env.NODE_ENV || 'development'
const jwtSecret = process.env.JWT_SECRET

if (jwtSecret.length < 32 && nodeEnv !== 'test') {
  console.warn(
    'Warning: JWT_SECRET is shorter than 32 characters. Use a longer random secret before deploying.',
  )
}

const parsedThreshold = Number(process.env.LOW_STOCK_THRESHOLD)
const lowStockThreshold =
  Number.isInteger(parsedThreshold) && parsedThreshold >= 0
    ? parsedThreshold
    : 5

const parseBoolean = (value, fallback) => {
  if (value === undefined || value === '') return fallback

  const normalized = String(value).trim().toLowerCase()
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false

  return fallback
}

const sameSiteValues = new Set(['lax', 'strict', 'none'])
const configuredSameSite = (process.env.COOKIE_SAME_SITE || 'lax')
  .trim()
  .toLowerCase()
const cookieSameSite = sameSiteValues.has(configuredSameSite)
  ? configuredSameSite
  : 'lax'

if (cookieSameSite !== configuredSameSite) {
  console.warn(
    `Warning: COOKIE_SAME_SITE must be one of lax, strict, or none. Falling back to lax.`,
  )
}

export const env = Object.freeze({
  nodeEnv,
  isProduction: nodeEnv === 'production',
  isTest: nodeEnv === 'test',
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  cookieName: process.env.JWT_COOKIE_NAME || 'shopsphere_token',
  cookieSameSite,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  allowAdminRegistration: parseBoolean(
    process.env.ALLOW_ADMIN_REGISTRATION,
    nodeEnv !== 'production',
  ),
  lowStockThreshold,
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    folder: process.env.CLOUDINARY_FOLDER || 'shopsphere/products',
  },
})
