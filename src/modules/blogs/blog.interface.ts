import { ObjectId } from 'mongoose'

export interface member {
  memberId: ObjectId | string
  role: string
}

export interface IBlog {
  _id: ObjectId
  image: string
  title: string
  description: string
  author: ObjectId | string
  isDeleted: boolean | { $ne: true }
  isRead: boolean
  role: string
  members: member[]
  Date: number
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
  $or?: Record<string, any>
  $unset?: Record<string, any>
  $push?: Record<string, any>
  $pull?: Record<string, any>
  [key: string]: any
}
