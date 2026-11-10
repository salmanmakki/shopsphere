import dns from 'node:dns'
import mongoose from 'mongoose'

const connectOptions = {
  serverSelectionTimeoutMS: 15000,
}

export const connectDB = async (uri = process.env.MONGO_URI) => {
  if (!uri) {
    throw new Error('MONGO_URI is not defined')
  }

  const connect = () => mongoose.connect(uri, connectOptions)

  try {
    await connect()
  } catch (error) {
    const dnsFailure = /querySrv|ECONNREFUSED|ENOTFOUND|ESERVFAIL/i.test(
      error.message,
    )

    if (!dnsFailure) {
      throw error
    }

    console.warn(
      'MongoDB SRV lookup failed with the system resolver. Retrying with public DNS...',
    )
    dns.setServers(['8.8.8.8', '1.1.1.1'])
    await connect()
  }

  console.log(`MongoDB connected: ${mongoose.connection.host}`)
  return mongoose.connection
}

export const disconnectDB = async () => {
  await mongoose.disconnect()
}
