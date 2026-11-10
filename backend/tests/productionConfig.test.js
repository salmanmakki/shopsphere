import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import request from 'supertest'

process.env.NODE_ENV = 'production'
process.env.JWT_SECRET =
  'shopsphere-production-test-secret-that-is-long-enough'
process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/shopsphere-production-test'
process.env.CLIENT_URL = 'https://shopsphere.vercel.app/'
process.env.ALLOW_ADMIN_REGISTRATION = 'false'
process.env.COOKIE_SAME_SITE = 'lax'

const app = (await import('../app.js')).default

describe('Production configuration', () => {
  test('admin registration is disabled by default', async () => {
    const response = await request(app)
      .post('/api/auth/admin/register')
      .send({
        name: 'Public Admin',
        email: 'public-admin@example.com',
        password: 'AdminPass123',
      })
      .expect(403)

    assert.equal(response.body.success, false)
    assert.match(response.body.message, /disabled/i)
  })

  test('health reports an unavailable database', async () => {
    const response = await request(app).get('/api/health').expect(503)

    assert.equal(response.body.success, false)
    assert.equal(response.body.database, 'disconnected')
  })

  test('configured origin is allowed without a trailing slash', async () => {
    const response = await request(app)
      .get('/api/health')
      .set('Origin', 'https://shopsphere.vercel.app')

    assert.equal(
      response.headers['access-control-allow-origin'],
      'https://shopsphere.vercel.app',
    )
    assert.equal(response.headers['access-control-allow-credentials'], 'true')
  })
})
