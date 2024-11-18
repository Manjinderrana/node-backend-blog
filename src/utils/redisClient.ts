import { createClient } from 'redis'
import logger from './logger'

const redisClient = createClient({
  url: process.env.REDIS_URL,
})

redisClient.on('connect', () => {
  logger.info(`Redis connected at http://redis:${process.env.REDIS_PORT}`)
})

redisClient.on('error', (err) => {
  console.error('Redis error:', err)
})

export default redisClient
