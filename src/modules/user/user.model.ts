import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import { IUser } from './user.interface'
import { CONSTANTS } from '../../utils/constants'

const userSchema = new mongoose.Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(CONSTANTS.ROLES),
      default: CONSTANTS.ROLES.USER,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    blogs: [
      {
        type: mongoose.Schema.Types.ObjectId, ref: 'blogs'
       },
    ],
    avatar: {
      type: String,
    },
    otp: {
      type: String,
      required: true,
    },
    otp_expiration: {
      type: Date,
    },
    watchHistory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'blogs',
    },
    watchLater: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'blogs',
      },
    ],
  },
  { timestamps: true, versionKey: false },
)

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  next()
})

userSchema.index({ email: 1 })

export const User = mongoose.model<IUser>('users', userSchema)
