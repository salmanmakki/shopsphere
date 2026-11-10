import assert from 'node:assert/strict'
import { after, before, describe, test } from 'node:test'
import request from 'supertest'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { connectDB, disconnectDB } from '../config/db.js'
import User from '../models/User.js'

process.env.NODE_ENV = 'test'
process.env.JWT_SECRET =
  'shopsphere-test-secret-key-that-is-long-enough-for-hs256'
process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/shopsphere-test-placeholder'
process.env.CLIENT_URL = 'http://localhost:5173'
process.env.JWT_COOKIE_NAME = 'shopsphere_token'
process.env.JWT_EXPIRES_IN = '7d'
process.env.LOW_STOCK_THRESHOLD = '5'

let mongoServer
let app
let Product
let customerAgent
let adminAgent
let createdProductId

const validProduct = {
  name: 'Test Desk Lamp',
  description: 'A minimal test lamp.',
  category: 'Home & Living',
  price: 99.5,
  originalPrice: 129.5,
  image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c',
  stock: 7,
  isFeatured: true,
  isBestSeller: false,
}

describe('ShopSphere API', () => {
  before(async () => {
    mongoServer = await MongoMemoryServer.create()
    await connectDB(mongoServer.getUri())

    app = (await import('../app.js')).default
    Product = (await import('../models/Product.js')).default

    await User.create({
      name: 'Test Admin',
      email: 'admin@example.com',
      password: 'AdminPass123',
      role: 'admin',
    })

    customerAgent = request.agent(app)
    adminAgent = request.agent(app)
  })

  after(async () => {
    await disconnectDB()
    await mongoServer.stop()
  })

  test('health endpoint is public', async () => {
    const response = await request(app).get('/api/health').expect(200)
    assert.equal(response.body.success, true)
    assert.equal(response.body.environment, 'test')
  })

  test('development CORS allows loopback origins', async () => {
    const response = await request(app)
      .get('/api/health')
      .set('Origin', 'http://127.0.0.1:5173')
      .expect(200)

    assert.equal(
      response.headers['access-control-allow-origin'],
      'http://127.0.0.1:5173',
    )
    assert.equal(response.headers['access-control-allow-credentials'], 'true')
  })

  test('registration rejects a self-assigned admin role', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Sneaky User',
        email: 'sneaky@example.com',
        password: 'Password123',
        role: 'admin',
      })
      .expect(422)

    assert.equal(response.body.success, false)
  })

  test('registers a customer without exposing the password', async () => {
    const response = await customerAgent
      .post('/api/auth/register')
      .send({
        name: 'Test Customer',
        email: 'customer@example.com',
        password: 'CustomerPass123',
      })
      .expect(201)

    assert.equal(response.body.success, true)
    assert.equal(response.body.user.role, 'customer')
    assert.equal(response.body.user.password, undefined)
    assert.match(response.headers['set-cookie'][0], /HttpOnly/i)
  })

  test('authenticated customer can fetch their profile', async () => {
    const response = await customerAgent.get('/api/auth/me').expect(200)
    assert.equal(response.body.user.email, 'customer@example.com')
  })

  test('duplicate registration returns 409', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Duplicate User',
        email: 'customer@example.com',
        password: 'CustomerPass123',
      })
      .expect(409)
  })

  test('logout clears the session cookie', async () => {
    await customerAgent.post('/api/auth/logout').expect(200)
    await customerAgent.get('/api/auth/me').expect(401)
  })

  test('login rejects invalid credentials', async () => {
    await request(app)
      .post('/api/auth/login')
      .send({ email: 'customer@example.com', password: 'WrongPassword' })
      .expect(401)
  })

  test('administrator can sign in', async () => {
    const response = await adminAgent
      .post('/api/auth/login')
      .send({ email: 'admin@example.com', password: 'AdminPass123' })
      .expect(200)

    assert.equal(response.body.user.role, 'admin')
  })

  test('admin registration creates a signed-in administrator', async () => {
    const agent = request.agent(app)

    const response = await agent
      .post('/api/auth/admin/register')
      .send({
        name: 'New Administrator',
        email: 'new-admin@example.com',
        password: 'NewAdminPass123',
      })
      .expect(201)

    assert.equal(response.body.user.role, 'admin')
    assert.equal(response.body.user.email, 'new-admin@example.com')
    assert.equal(response.body.user.password, undefined)

    const profile = await agent.get('/api/auth/me').expect(200)
    assert.equal(profile.body.user.email, 'new-admin@example.com')
  })

  test('unauthenticated and customer users cannot access admin routes', async () => {
    await request(app).get('/api/admin/dashboard').expect(401)

    await customerAgent
      .post('/api/auth/login')
      .send({ email: 'customer@example.com', password: 'CustomerPass123' })
      .expect(200)

    await customerAgent.get('/api/admin/dashboard').expect(403)
    await customerAgent
      .post('/api/admin/products')
      .send(validProduct)
      .expect(403)
  })

  test('admin creates a product with validated values', async () => {
    const response = await adminAgent
      .post('/api/admin/products')
      .send(validProduct)
      .expect(201)

    createdProductId = response.body.data._id
    assert.equal(response.body.data.name, validProduct.name)
    assert.equal(response.body.data.price, validProduct.price)
    assert.equal(response.body.data.stock, validProduct.stock)
    assert.equal(response.body.data.isFeatured, true)
  })

  test('admin product validation rejects bad values', async () => {
    await adminAgent
      .post('/api/admin/products')
      .send({ ...validProduct, name: '', price: -10 })
      .expect(422)

    await adminAgent
      .post('/api/admin/products')
      .send({ ...validProduct, name: 'Bad Pricing', originalPrice: 10, price: 50 })
      .expect(422)
  })

  test('public products support case-insensitive search', async () => {
    const response = await request(app)
      .get('/api/products?search=DESK')
      .expect(200)

    assert.equal(response.body.meta.total, 1)
    assert.equal(response.body.data[0].name, validProduct.name)
  })

  test('public products support category and price filters together', async () => {
    const response = await request(app)
      .get('/api/products?category=Home%20%26%20Living&minPrice=50&maxPrice=100')
      .expect(200)

    assert.equal(response.body.meta.total, 1)
  })

  test('invalid price range returns 400', async () => {
    const response = await request(app)
      .get('/api/products?minPrice=100&maxPrice=10')
      .expect(400)

    assert.equal(response.body.success, false)
  })

  test('sorting and pagination metadata work', async () => {
    await adminAgent.post('/api/admin/products').send({
      ...validProduct,
      name: 'Alpha Accessory',
      category: 'Accessories',
      price: 20,
      originalPrice: null,
      stock: 1,
    })

    const response = await request(app)
      .get('/api/products?sort=price_asc&limit=1&page=1')
      .expect(200)

    assert.equal(response.body.data.length, 1)
    assert.equal(response.body.data[0].price, 20)
    assert.equal(response.body.meta.page, 1)
    assert.equal(response.body.meta.limit, 1)
    assert.ok(response.body.meta.total >= 2)
    assert.equal(response.body.meta.hasNextPage, true)
  })

  test('invalid ObjectIds are rejected and missing products return 404', async () => {
    await request(app).get('/api/products/not-an-id').expect(400)
    await request(app)
      .get('/api/products/652f1a2b3c4d5e6f708192a3')
      .expect(404)
  })

  test('admin can update a product', async () => {
    const response = await adminAgent
      .put(`/api/admin/products/${createdProductId}`)
      .send({ ...validProduct, price: 79, stock: 2, isFeatured: false })
      .expect(200)

    assert.equal(response.body.data.price, 79)
    assert.equal(response.body.data.stock, 2)
    assert.equal(response.body.data.isFeatured, false)

    const publicResponse = await request(app)
      .get(`/api/products/${createdProductId}`)
      .expect(200)
    assert.equal(publicResponse.body.data.price, 79)
  })

  test('categories are aggregated with stock bands', async () => {
    const response = await request(app)
      .get('/api/products/categories')
      .expect(200)

    const home = response.body.data.find((item) => item.name === 'Home & Living')
    assert.ok(home)
    assert.equal(home.count, 1)
    assert.equal(home.lowStock, 1)
    assert.equal(home.outOfStock, 0)
  })

  test('dashboard statistics are calculated from the database', async () => {
    const response = await adminAgent.get('/api/admin/dashboard').expect(200)
    const { stats } = response.body.data

    assert.equal(stats.totalProducts, 2)
    assert.equal(stats.totalCategories, 2)
    assert.equal(stats.lowStock, 2)
    assert.equal(stats.outOfStock, 0)
    assert.equal(response.body.data.recentProducts.length, 2)
  })

  test('admin can delete a product', async () => {
    await adminAgent
      .delete(`/api/admin/products/${createdProductId}`)
      .expect(200)

    await request(app).get(`/api/products/${createdProductId}`).expect(404)
  })

  test('public routes cannot create products', async () => {
    await request(app).post('/api/products').send(validProduct).expect(404)
  })

  test('image upload requires an attached file', async () => {
    await adminAgent.post('/api/admin/upload').expect(400)
  })
})
