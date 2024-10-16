import { IUser } from '../modules/user/user.interface'
import jwt from 'jsonwebtoken'
import { ApiError } from './error'

export const decodedAccessToken = (token: string): any => {
  try {
    return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || '')
  } catch (error: any) {
    throw new ApiError(400, `Invalid or expired Token: ${error.message}`)
  }
}

export const decodedRefreshToken = (token: string): any => {
  try {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET || '')
  } catch (error: any) {
    throw new ApiError(400, `Invalid or expired Token: ${error.message}`)
  }
}

export const encryptAccessToken = (user: Partial<IUser>): string => {
  try {
    return jwt.sign({ _id: user?._id }, process.env.ACCESS_TOKEN_SECRET || '', { expiresIn: '50m' })
  } catch (error) {
    throw new Error('Error in generating Token')
  }
}

export const encryptRefreshToken = (user: Partial<IUser>): string => {
  try {
    return jwt.sign({ _id: user?._id }, process.env.REFRESH_TOKEN_SECRET || '', { expiresIn: '7d' })
  } catch (error) {
    throw new Error('Error in generating Token')
  }
}
