import mongoose from 'mongoose'
import { ILikes } from './like.interface'

const likeSchema = new mongoose.Schema<ILikes>(
  {
    likedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
    },
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'blogs',
      required: true,
    },
  },
  { timestamps: true, versionKey: false },
)

const Like = mongoose.model<ILikes>('Like', likeSchema)

export default Like
