import { ObjectId } from 'mongoose'

export interface ILikes {
  _id: ObjectId | string
  likedBy: ObjectId | string
  blogId: ObjectId | string
}
