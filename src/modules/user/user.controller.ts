import { Request, Response } from 'express'
import { ApiError } from '../../utils/error'
import { ApiResponse } from '../../utils/response'
import { UserRequest } from '../../utils/interface'
import * as userService from './user.service'
import * as blogService from '../../modules/blogs/blog.service'
import * as subscriptionService from '../../modules/subscriptions/subscription.service'
import { decodedAccessToken, encryptAccessToken } from '../../utils/jwtUtils'
import { sendMail } from '../../utils/sendMail'
import { hashPassword } from '../../utils/hashPassword'
import { IUser } from './user.interface'
import wrap from '../../utils/asyncHandler'

export const getAllUsers = wrap(async (_req: Request, res: Response): Promise<void | Response> => {
  const users = await userService.find({}, '_id username email role')

  if (users?.length === 0) {
    throw new ApiError(400, 'users data not found')
  }

  const emails = users?.map((ele: Partial<IUser>) => {
    return { email: ele?.email, role: ele?.role }
  })

  return res.status(200).json(new ApiResponse(200, { users, emails }, 'Users data fetched successfully'))
})

export const forgotPassword = wrap(async (req: Request, res: Response): Promise<void | Response> => {
  const { email } = req.body

  const user = await userService.findOne({ email }, '_id username email')

  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  const token = encryptAccessToken(user)

  const text = `http://localhost:3000/user/reset-password/${token}}`

  const subject = 'forgot password reset'

  const html = `<div
        class="container"
        style="max-width: 90%; margin: auto; padding-top: 20px"; justify-content: center; align-items: center
      >
        <p style="margin-bottom: 30px;">Please click the below link to reset your password</p>
        <h1 style="font-size: 20px; letter-spacing: 2px; text-align:center;">${text}</h1>
   </div>`

  sendMail(user?.email, subject, text, html)

  return res.status(200).json(new ApiResponse(200, {}, 'Mail sent successfully'))
})

export const resetPassword = wrap(async (req: Request, res: Response): Promise<void | Response> => {
  const { token } = req.params
  const { password } = req.body

  if (!token) {
    throw new ApiError(400, 'token not found')
  }

  const hashed = await hashPassword(password)

  const decoded = decodedAccessToken(token)

  if (decoded) {
    await userService.findByIdandUpdate({ _id: decoded._id }, { password: hashed }, { new: true })
  }

  return res.status(200).json(new ApiResponse(200, {}, 'Password reset successfully'))
})

export const changePassword = wrap(async (req: Request, res: Response): Promise<Response | void> => {
  const { newPassword, confirmNewPassword } = req.body

  if (newPassword.toString() !== confirmNewPassword.toString()) {
    throw new ApiError(400, 'password does not match')
  }

  const user = await userService.findOne({ _id: (req as UserRequest).user?._id }, '_id password')

  if (user) user.password = newPassword

  await user?.save()

  return res.status(200).json(new ApiResponse(200, user, 'password updated successfully'))
})

export const updateUser = wrap(async (req: Request, res: Response): Promise<Response | void> => {
  const { username, email } = req.body

  const user = await userService.updateOne({ _id: (req as UserRequest).user?._id }, { username, email }, { new: true })

  if (!user) {
    throw new ApiError(404, 'User not found')
  }

  return res.status(200).json(new ApiResponse(200, user, 'User Details Updated Successfully'))
})

export const subscribe = wrap(async (req: Request, res: Response): Promise<Response | void> => {
  const { username } = req.query

  const userId = (req as UserRequest)?.user?._id

  const user = await userService.findOne({ username }, '_id username email')

  if (userId.toString() == user?._id.toString()) {
    throw new ApiError(409, 'You cannot subscribe your channel')
  }

  const alreadySubscriber = await subscriptionService.getOne({ $and: [{ subscribedToId: user?._id }, { subscriberId: userId }] })

  if (!alreadySubscriber) {
    await subscriptionService.create({
      subscribedToId: user?._id,
      subscriberId: userId,
    })

    return res.status(201).json(new ApiResponse(201, {}, 'Channel subscribed Successfully'))
  } else {
    await subscriptionService.deleteOne({ $and: [{ subscribedToId: user?._id }, { subscriberId: userId }] })
  }

  return res.status(200).json(new ApiResponse(200, {}, 'Channel unSubscribed Successfully'))
})

export const getChannelInfo = wrap(async (req: Request, res: Response): Promise<Response | void> => {
  const { username } = req.query

  const [channel] = await userService.aggregate([
    {
      $match: { username },
    },
    {
      $lookup: {
        from: 'subscriptions',
        localField: '_id',
        foreignField: 'subscribedToId',
        as: 'subscriber',
      },
    },
    {
      $lookup: {
        from: 'subscriptions',
        localField: '_id',
        foreignField: 'subscriberId',
        as: 'subscribedTo',
      },
    },
    {
      $addFields: {
        subscribersCount: { $size: '$subscriber' },
        subscribedTo: { $size: '$subscribedTo' },
      },
    },
    {
      $unwind: { path: '$subscriber', preserveNullAndEmptyArrays: true },
    },
    {
      $unwind: { path: '$subscribedTo', preserveNullAndEmptyArrays: true },
    },
    {
      $project: {
        _id: 1,
        email: 1,
        username: 1,
        subscribersCount: 1,
        subscribedTo: 1,
      },
    },
  ])

  return res.status(200).json(new ApiResponse(200, channel, 'Channel info fetched successfully'))
})

export const watchLater = wrap(async (req: Request, res: Response): Promise<Response | void> => {
  const { blogId } = req.query

  const alreadyWatchLater = (req as UserRequest)?.user?.watchLater?.includes(blogId)

  if (!alreadyWatchLater) {
    ;(req as UserRequest)?.user?.watchLater.push({ _id: blogId })
    await (req as UserRequest)?.user.save()

    return res.status(200).json(new ApiResponse(200, {}, 'Added to watchLater'))
  } else {
    return res.status(200).json(new ApiResponse(200, {}, 'Already added to watchLater'))
  }
})

export const watchHistory = wrap(async (req: Request, res: Response): Promise<Response | void> => {
  const { skip, limit } = req.query

  const { readCount } = await blogService.getAllBlogs({}, Number(skip), Number(limit))

  return res.status(200).json(new ApiResponse(200, readCount, 'Watch history fetched successfully'))
})

export const removeFromWatchHistory = wrap(async (req: Request, res: Response): Promise<Response | void> => {
  const { blogId } = req.query

  const remove = await blogService.updateBlog({ _id: blogId }, { isRead: false }, { new: true })

  return res.status(200).json(new ApiResponse(200, remove, 'Blog removed from watchHistory successfully'))
})
