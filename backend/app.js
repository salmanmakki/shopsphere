import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import mongoose from 'mongoose'
import { env } from './config/env.js'
import authRoutes from './routes/authRoutes.js'
import productRoutes from './routes/productRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import { generalLimiter } from './middleware/rateLimiters.js'
import notFound from './middleware/notFound.js'
import errorHandler from './middleware/errorMiddleware.js'

const app = express()

app.set('trust proxy', 1)
app.disable('x-powered-by')

const normalizeOrigin = (origin) => origin.replace(/\/+$/, '')

const configuredOrigins = env.clientUrl
  .split(',')
  .map((origin) => normalizeOrigin(origin.trim()))
  .filter(Boolean)

const allowedOrigins = env.isProduction
  ? configuredOrigins
  : [
      ...new Set([
        ...configuredOrigins,
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:4173',
        'http://127.0.0.1:4173',
      ]),
    ]

app.use(helmet())
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(normalizeOrigin(origin))) {
        return callback(null, true)
      }
      return callback(new Error('Origin not allowed by CORS'))
    },
    credentials: true,
    maxAge: 86_400,
    optionsSuccessStatus: 204,
  }),
)
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))
app.use(cookieParser())

app.get('/api/health', (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1

  res.status(databaseConnected ? 200 : 503).json({
    success: databaseConnected,
    message: databaseConnected
      ? 'ShopSphere API is running'
      : 'ShopSphere API is starting or the database is unavailable',
    database: databaseConnected ? 'connected' : 'disconnected',
    environment: env.nodeEnv,
  })
})

app.use('/api', generalLimiter)
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/admin', adminRoutes)

app.use(notFound)
app.use(errorHandler)

export default app
