import { ObjectId } from 'mongoose'

export interface ISubscription {
  _id: ObjectId | string
  subscriberId: ObjectId | string
  subscribedId: ObjectId | string
}
