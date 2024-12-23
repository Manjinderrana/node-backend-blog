import { UserRequest } from '../utils/interface'
import { NextFunction, Request, Response } from 'express'
import * as userService from '../modules/user/user.service'
import { ApiError } from '../utils/error'

const permission = (roles: string[]) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<Response | void> => {
    try {
      const userId = (req as UserRequest)?.user?._id

      const user = await userService.findOne(userId, '_id blogs email role')

      if (roles.includes(user?.role as string)) {
        next()
      } else {
        throw new ApiError(401, 'Permission not granted')
      }
    } catch (error) {
      throw new ApiError(401, "You don't have permission")
    }
  }
}

export default permission

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if ((req as UserRequest).user && (req as UserRequest).user?.role === 'ADMIN') {
    return next()
  } else {
    return res.status(403).json({ message: 'Unauthorized' })
  }
}
