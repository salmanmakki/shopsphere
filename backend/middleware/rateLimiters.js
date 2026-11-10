import rateLimit from 'express-rate-limit'
import { env } from '../config/env.js'

const skip = () => env.isTest

const handler = (req, res) => {
  res.status(429).json({
    success: false,
    message: 'Too many requests. Please try again in a few minutes.',
  })
}

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip,
  handler,
})

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip,
  handler,
})
