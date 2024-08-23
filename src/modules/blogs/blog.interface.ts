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
