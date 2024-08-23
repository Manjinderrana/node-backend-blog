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

