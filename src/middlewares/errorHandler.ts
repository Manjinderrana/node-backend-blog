import mongoose from 'mongoose'
import { ApiError } from '../utils/error'
import httpStatus from 'http-status'
import { NextFunction, Request, Response } from 'express'
import logger from '../utils/logger'

export const errorHandler = (err: ApiError, _req: Request, res: Response, _next: NextFunction) => {
  if (process.env.NODE_ENV  === 'development') {
    logger.error(`${err?.stack}`)
  }
  return res.status(err?.status || 500).json({ message: err?.message || 'Internal server error' })
}

export const errorConverter = (err: any, _req: Request, _res: Response, next: NextFunction) => {
  let error = err
  if (!(error instanceof ApiError)) {
    const status = error.status || error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR
    const message: string = error.message || `${httpStatus[status]}`
    error = new ApiError(status, message, err.stack)
  }

  next(error)
}
