import 'dotenv/config'
import app from './app.js'
import { connectDB, disconnectDB } from './config/db.js'

const PORT = Number(process.env.PORT) || 5000

const start = async () => {
  await connectDB()

  const server = app.listen(PORT, () => {
    console.log(`ShopSphere API listening on http://localhost:${PORT}`)
  })

  server.on('error', (error) => {
    console.error('HTTP server error:', error.message)
    process.exit(1)
  })

  let shuttingDown = false

  const shutdown = async (signal) => {
    if (shuttingDown) return
    shuttingDown = true

    console.log(`${signal} received. Closing HTTP server...`)
    server.close(async () => {
      try {
        await disconnectDB()
      } catch (error) {
        console.error('Error while closing MongoDB connection:', error.message)
      }
      process.exit(0)
    })

    setTimeout(() => process.exit(1), 10_000).unref()
  }

  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))
}

start().catch((error) => {
  console.error('Failed to start ShopSphere API:', error.message)
  process.exit(1)
})
