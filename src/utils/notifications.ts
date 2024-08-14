import { ObjectId } from 'mongoose'
import { ApiError } from './error'
import * as notificationService from '../../src/modules/notifications/notification.service'
import * as blogService from '../../src/modules/blogs/blog.service'
import { customInterface } from './interface'
import { convertToObjectId } from './convertToObjectId'
import { INotification } from '../../src/modules/notifications/notification.interface'

const sendNotifications = async (userId: ObjectId, blogId: ObjectId, message1?: string, message2?: string): Promise<INotification> => {
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

    let data: any
    if (uniqueUserIdsArray && message1)
      if (uniqueUserIdsArray?.length != 0) data = uniqueUserIdsArray.filter((element) => element?.toString() !== blog?.author?.toString())

    const filteredIds = data.map((ele: any) => {
      return {
        userId: convertToObjectId(ele),
        blogId: blogId,
        message1: message1,
      }
    })

    const createdNotification = await notificationService.createNotification(filteredIds)

    io.to(filteredIds?.ele?.toString()).emit('notification', JSON.stringify(createdNotification))

    if (blog?.author && message2) {
      const createdNotification = await notificationService.createNotification({
        userId: blog?.author,
        blogId,
        message2,
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
