import logger from './utils/logger'
import connectDB from './db/server'
import httpServer from './app'
import cron from 'node-cron'
import redisClient from './utils/redisClient'
import seed from './seed/seed'

connectDB()
  .then(() => {
    seed()
    const server = httpServer.listen(process.env.PORT, () => {
      redisClient.connect()
      logger.info(`Server started on port http://localhost:${process.env.PORT}`)
      cron.schedule('*/5 * * * *', () => {
        logger.info('Running scheduled job after every 5 minutes')
      })
    })

    server.on('error', (err: NodeJS.ErrnoException) => {
      logger.error(err.message)
    })

    const unexpectedErrorHandler = (error: string) => {
      logger.error(error)
    }

    process.on('uncaughtException', unexpectedErrorHandler)
    process.on('unhandledRejection', unexpectedErrorHandler)
  })
  .catch((err) => {
    logger.error(`Database connection error: ${err.message}`)
    process.exit(1)
  })
