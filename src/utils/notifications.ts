import { ObjectId } from 'mongoose'
import { ApiError } from './error'
import * as notificationService from '../modules/notifications/notification.service'
import * as blogService from '../modules/blogs/blog.service'
import { customInterface } from './interface'
import { INotification } from '../modules/notifications/notification.interface'

const sendNotifications = async (userId: ObjectId, blogId: ObjectId, userMessage?: string, adminMessage?: string): Promise<INotification> => {
  try {
    // const notification = await notificationService.getNotification({ $and:[{userId: userId}, {blogId: blogId},{message: message}] })

    // if (notification?.message === message) {
    //   throw new ApiError(400, "Notification already exists")
    // }

    const blog = await blogService.getBlog({ _id: blogId }, 'members author')

    const blogMembers = blog?.members.map((ele: customInterface) => ele?.memberId)

    const uniqueUserIds = new Set([...(blogMembers ?? [])])

    const uniqueUserIdsArray = Array.from(uniqueUserIds)

    uniqueUserIdsArray.push(userId)

    let data: ObjectId[] = []
    if (uniqueUserIdsArray && userMessage)
      if (uniqueUserIdsArray?.length != 0) data = uniqueUserIdsArray.filter((element) => element?.toString() !== blog?.author?.toString())

    const filteredIds = data.map((ele: ObjectId) => {
      return {
        userId: ele,
        blogId,
        userMessage: userMessage,
      }
    })

    const createdNotification = await notificationService.createNotification(filteredIds as Partial<INotification>)

    io.to(data?.map((userId: ObjectId) => userId.toString())).emit('notification', JSON.stringify(createdNotification))

    if (blog?.author && adminMessage) {
      const createdNotification = await notificationService.createNotification({
        userId: blog?.author,
        blogId,
        adminMessage,
      })

      io.to(blog?.author as string).emit('notification', JSON.stringify(createdNotification))

      return createdNotification
    }

    return createdNotification
  } catch (error: any) {
    throw new ApiError(error.status, error.message)
  }
}

export default sendNotifications
