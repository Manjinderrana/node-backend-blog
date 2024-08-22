import { ObjectId } from 'mongoose'

export interface INotification {
  _id: ObjectId | string
  userId: ObjectId | string
  blogId: ObjectId | string
  adminUser: ObjectId | string
  userMessage: string
  adminMessage: string
  isRead: boolean
  isDeleted: boolean
}
