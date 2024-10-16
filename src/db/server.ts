import logger from '../utils/logger'
import mongoose from 'mongoose'

const connectDB = async (): Promise<void | Response> => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || '')
    logger.info(`Database connected Successfully: ${conn.connection.host}`)
  } catch (error: any) {
    logger.info('Database connection error', { message: error.message, stack: error.stack })
    process.exit(1)
  }
}

export default connectDB
