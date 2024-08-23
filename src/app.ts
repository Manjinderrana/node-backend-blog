import { Application, NextFunction, Request, Response } from 'express'
import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import userRoutes from './routes/user.route'
import blogRoutes from './routes/blog.route'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import cors from 'cors'
import authRoutes from './routes/auth.route'
import { verifyJwt } from './middlewares/verifyJwt'
import http from 'http'
import { Server, Socket } from 'socket.io'
import notificationRoutes from './routes/notification.route'
import { errorHandler } from './middlewares/errorHandler'
import logger from './utils/logger'
import {CustomError} from "./utils/interfaces"
import httpStatus from 'http-status'

const app: Application = express()

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(express.static("public"))
app.use(cookieParser())
app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}))

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/user', verifyJwt, userRoutes)
app.use('/api/v1/blog', verifyJwt, blogRoutes)
app.use('/api/v1/notification', verifyJwt, notificationRoutes)

app.use(errorHandler)

app.get('/', (_req: Request, res: Response) => {
  res.json({message: 'Backend working'})
})

app.use("*", (_req: Request, _res: Response, next: NextFunction) => {
  const error = {
    status: 404,
    message: httpStatus.NOT_FOUND,
  };
  next(error);
});

app.use((err: CustomError, _req: Request, res: Response, _next:NextFunction) => {
  const status = err.status || 500;
  const message = err.message || httpStatus.INTERNAL_SERVER_ERROR
  const data = err.data || null;
  res.status(status).json({
    type: "error",
    message,
    data,
  })
})

declare global {
  var io: Server
  var socket: Socket
}

const httpServer = http.createServer(app)
const io = new Server(httpServer)
global.io = io

app.get('/socket', (_req: Request, res: Response) => {
  res.send('Socket.IO with Express and TypeScript')
})

io.on('connection', (socket: Socket) => {
  global.socket = socket
  logger.info('A user connected')

  socket.on('chat message', (message: string) => {
    logger.info('Received message:', message)
    io.emit('chat message', message)
  })

  socket.on('disconnect', () => {
    logger.info('User disconnected')
  })
})

export default httpServer
