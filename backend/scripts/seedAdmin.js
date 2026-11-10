import 'dotenv/config'
import { connectDB, disconnectDB } from '../config/db.js'
import User from '../models/User.js'

const seedAdmin = async () => {
  const name = (process.env.ADMIN_NAME || 'ShopSphere Admin').trim()
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD || ''

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env')
  }

  if (password.length < 8) {
    throw new Error('ADMIN_PASSWORD must be at least 8 characters')
  }

  await connectDB()

  const existingUser = await User.findOne({ email }).select('+password')

  if (existingUser) {
    existingUser.name = name
    existingUser.role = 'admin'
    existingUser.password = password
    await existingUser.save()
    console.log(`Administrator updated: ${email}`)
  } else {
    await User.create({ name, email, password, role: 'admin' })
    console.log(`Administrator created: ${email}`)
  }

  console.log('Admin bootstrap complete. Keep the credentials private.')
}

seedAdmin()
  .catch((error) => {
    console.error(`Admin seed failed: ${error.message}`)
    process.exitCode = 1
  })
  .finally(async () => {
    await disconnectDB()
  })
