import { customInterface } from '../user/user.service'
import { INotification } from './notification.interface'
import Notification from './notification.model'

export const createNotification = async (data: Partial<INotification>) => {
  return await Notification.create(data)
}

export const getNotification = async (data: customInterface) => {
  return await Notification.findOne(data)
}

export const getAllNotificationsList = async (searchQuery: customInterface, skip: number, limit: number) => {
  const notifications = await Notification.aggregate([
    {
      $match: searchQuery,
    },
    ...(skip || limit
      ? [
          {
            $skip: skip,
          },
          {
            $limit: limit,
          },
        ]
      : []),
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              email: 1,
            },
          },
        ],
        as: 'userData',
      },
    },
    {
      $unwind: '$userData',
    },
  ]).sort({ createdAt: -1 })

  // const notifications = await Notification.find(searchQuery).skip(skip).limit(limit).populate("userId").sort({ createdAt: -1})
  const count = await Notification.countDocuments(searchQuery)
  const unreadCount = await Notification.countDocuments({ isRead: false, ...searchQuery })

  return { notifications, count, unreadCount }
}

export const updateMany = async (searchQuery: customInterface, updateQuery: customInterface, options: customInterface) => {
  return await Notification.updateMany(searchQuery, updateQuery, options)
}

export const deleteNotification = async (data: any) => {
  return await Notification.deleteOne(data)
}
