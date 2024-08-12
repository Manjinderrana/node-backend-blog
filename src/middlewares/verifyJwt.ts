import { ApiError } from '../utils/error'
import { User } from '../../src/modules/user/user.model'
import { NextFunction, Request, Response } from 'express'
import redisClient from '../../src/utils/redisClient'
import { UserRequest } from '../../src/utils/interface'
import { decodeToken } from '../../src/utils/jwtUtils'

export const verifyJwt = async (req: Request, _res: Response, next: NextFunction): Promise<any> => {
  try {
    const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
      throw new ApiError(401, 'Unauthorized: No token provided')
    }

    const isRevoked = await redisClient.get('accessToken')

    if (isRevoked) {
      throw new ApiError(401, 'Token has been revoked')
    }

    const decoded = decodeToken(token)

    const user = await User.findById(decoded?._id)

    ;(req as UserRequest).user = user

    next()
  } catch (error: any) {
    throw new ApiError(error.status, error.message)
  }
}
