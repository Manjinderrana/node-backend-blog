import logger from '../../src/utils/logger'
import mongoose from 'mongoose'

const connectDB = async (): Promise<void | Response> => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI ?? 'mongodb://localhost:27017')
    logger.info(`Database connected Successfully: ${conn.connection.port}`)
  } catch (error: any) {
    logger.info('Database connection error', error.message)
    process.exit(1)
  }
}

export default connectDB

