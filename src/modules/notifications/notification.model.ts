import mongoose from 'mongoose'
import { INotification } from './notification.interface'

const notificationSchema = new mongoose.Schema<INotification>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    blogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'blogs',
    },
    message1: {
      type: String,
    },
    message2: {
      type: String,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

const Notification = mongoose.model<INotification>('Notification', notificationSchema)

export default Notification
