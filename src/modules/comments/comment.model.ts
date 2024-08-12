import mongoose from 'mongoose'
import { IComment } from './comment.interface'

const commentSchema = new mongoose.Schema<IComment>(
  {
    commentedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
    },
    commentString: {
      type: String,
      required: true,
    },
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'blogs',
    },
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

const Comment = mongoose.model<IComment>('Comment', commentSchema)

export default Comment
