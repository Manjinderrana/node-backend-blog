import { UserRequest } from '../../src/utils/interface'
import { NextFunction, Request, Response } from 'express'
import * as userService from '../../src/modules/user/user.service'
// import * as rolePermissionService from '../../src/modules/rolePermissions/rolePermissions.service'
import { ApiError } from '../../src/utils/error'

const permission = (roles: any[]) => {
  return async (req: Request, _res: Response, next: NextFunction): Promise<any> => {
    try {
      const userId = (req as UserRequest)?.user?._id
      
      const user = await userService.findOne(userId, '_id blogs email role')

      // const rolePermission = await rolePermissionService.getOnePermission({roleName: user?.role})
        if (roles.includes(user?.role)) {
          next()
        } else {
          throw new ApiError(401, 'Permission not granted')
        }
      }
      catch (error) {
      throw new ApiError(401, "You don't have permission")
    }
  }
}

export default permission

// // Middleware to check if user is admin
// export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
//   if ( (req as UserRequest).user &&  (req as UserRequest).user?.role === 'ADMIN') {
//     return next()
//   } else {
//     return res.status(403).json({ message: "Unauthorized" })
//   }
// }
