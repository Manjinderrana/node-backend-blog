import { Request } from 'express'
// import { IUser } from '../../src/modules/user/user.interface'

// declare global {
//   namespace Express {
//     interface Request {
//       user?: Partial<IUser>
//     }
//   }
// }


export interface UserRequest extends Request {
  user?: any
  req?: any
  _id?: any
}

export interface customInterface {
  [key: string]: any
}

export default UserRequest

