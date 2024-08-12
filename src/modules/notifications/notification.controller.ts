import { Request, Response } from 'express'
import * as notificationService from '../../modules/notifications/notification.service'
import wrap from '../../utils/asyncHandler'
import UserRequest from '../../utils/interface'
import { ApiResponse } from '../../utils/response'

export const getAllNotifications = wrap(async (req: Request, res: Response) => {
  const userId = (req as UserRequest)?.user?._id

  const { skip = 0, limit = 0 } = req.params

  const { notifications, count, unreadCount } = await notificationService.getAllNotificationsList({ userId }, skip as number, limit as number)

  return res.status(200).json(new ApiResponse(200, { notifications, count, unreadCount }, 'All notification fetched successfully'))
})

export const markAsRead = wrap(async (req: Request, res: Response) => {
  const userId = (req as UserRequest)?.user?._id

  const { notificationId } = req.query

  await notificationService.updateMany(
    {
      ...(notificationId ? { _id: notificationId } : {}),
      userId,
    },
    { isRead: true },
    { new: true },
  )

  return res.status(200).json(new ApiResponse(200, {}, 'All notification mark as read successfully'))
})

export const removeNotifications = wrap(async (req: Request, res: Response) => {
  const userId = (req as UserRequest)?.user?._id

  const { notificationId } = req.query

  await notificationService.updateMany(
    {
      ...(notificationId ? { _id: notificationId } : {}),
      userId,
    },
    { isDeleted: true, isRead: true },
    { new: true },
  )

  return res.status(200).json(new ApiResponse(200, {}, 'All notification removed successfully'))
})
