import { ObjectId } from 'mongoose'

export interface IUser {
  _id: ObjectId | string
  username: string
  email: string
  avatar: String
  password: string
  otp: string
  otp_expiration: Date
  role: string
  blogs: (ObjectId | string)[]
  isVerified: boolean
  watchLater: (ObjectId | string)[]
  watchHistory: (ObjectId | string)[]
}

export interface options {
  new?: boolean
  upsert?: boolean
  projection?: {
    [key: string]: number
  }
}

export interface UpdateQuery {
  $set?: Record<string, any>
  $unset?: Record<string, any>
  $push?: Record<string, any>
  $pull?: Record<string, any>
  [key: string]: any
}
