import { env } from '../config/env.js'

const parseDurationToMs = (duration, fallback) => {
  if (typeof duration !== 'string') {
    return fallback
  }

  const match = duration.trim().match(/^(\d+)(s|m|h|d)$/)
  if (!match) {
    return fallback
  }

  const value = Number(match[1])
  const unitMs = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }
  return value * unitMs[match[2]]
}

const baseCookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: env.cookieSameSite,
  path: '/',
}

export const setAuthCookie = (res, token) => {
  res.cookie(env.cookieName, token, {
    ...baseCookieOptions,
    maxAge: parseDurationToMs(env.jwtExpiresIn, 7 * 86_400_000),
  })
}

export const clearAuthCookie = (res) => {
  res.clearCookie(env.cookieName, baseCookieOptions)
}
