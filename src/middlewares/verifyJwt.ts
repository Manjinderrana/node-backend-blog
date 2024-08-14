import { ApiError } from '../utils/error'
import { User } from '../../src/modules/user/user.model'
import { NextFunction, Request, Response } from 'express'
import redisClient from '../../src/utils/redisClient'
import { UserRequest } from '../../src/utils/interface'
import { decodedAccessToken } from '../../src/utils/jwtUtils'
import wrap from '../../src/utils/asyncHandler'

export const verifyJwt = wrap (async (req: Request, _res: Response, next: NextFunction): Promise<Response | void> => {
    const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
      throw new ApiError(401, 'Unauthorized: No token provided')
    }

    const isRevoked = await redisClient.get(token)

    if (isRevoked == 'blacklisted') {
      throw new ApiError(401, 'Token has been revoked')
    }

    const decoded = decodedAccessToken(token)

    const user = await User.findById(decoded?._id)

    ;(req as UserRequest).user = user

    next()
})
