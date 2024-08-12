import mongoose from 'mongoose'
import { IBlog } from './blog.interface'

const blogSchema = new mongoose.Schema<IBlog>(
  {
    image: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      unique: true,
      minLength: 3,
    },
    description: {
      type: String,
      required: true,
      minLength: [6, 'minimumm 6 characters'],
    },
    members: [
      {
        memberId: { type: mongoose.Schema.Types.ObjectId, ref: "users" },
        role: { type: String, enum: ["ADMIN", "USER", "MAINTAINER", "GUEST"] },
      },
    ],
    author: {
       type: mongoose.Schema.Types.ObjectId, ref: 'users' ,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isRead: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true, versionKey: false  },
)

const Blog = mongoose.model<IBlog>('Blog', blogSchema)

export default Blog
