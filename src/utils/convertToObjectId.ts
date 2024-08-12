import { ObjectId } from 'mongodb'
import mongoose from 'mongoose'

export const convertToObjectId = (ObjectIdString: string | ObjectId) => {
  return new mongoose.Types.ObjectId(ObjectIdString)
}
