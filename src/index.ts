import logger from './utils/logger'
import connectDB from './db/server'
import httpServer from './app'
import cron from 'node-cron'
import redisClient from './utils/redisClient'
import seed from './seed/seed'
import * as notificationService from '../src/modules/notifications/notification.service'
import { monthAgo } from './utils/date'

connectDB()
  .then(() => {
    seed()
    const server = httpServer.listen(process.env.PORT, () => {
      redisClient.connect()
      logger.info(`Server started on port http://localhost:${process.env.PORT}`)
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
cron.schedule('*/5 * * * *', () => {
  logger.info('Running scheduled job after every 5 minutes')
})
cron.schedule('0 0 */30 * *', async () => {
  try {
    const deleted = await notificationService.deleteMany({ $and: [{ createdAt: { $lte: monthAgo } }, { isRead: true }] })
    deleted?.deletedCount > 0 ? logger.info('Notification deleted successfully 30 days ago') : logger.info('No Notifications to delete')
  } catch (error: any) {
    logger.error(`Error while deleting notification: ${error?.stack}`)
  }
})
