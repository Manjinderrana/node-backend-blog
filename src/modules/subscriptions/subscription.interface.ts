import { ObjectId } from 'mongoose'

export interface ISubscription {
  _id: ObjectId | string
  subscriberId: ObjectId | string
  subscribedToId: ObjectId | string
}
