import { ObjectId } from "mongoose";

export interface INotification {
    _id: ObjectId | string
    userId: ObjectId | string
    blogId: ObjectId | string
    adminUser: ObjectId | string
    message1: string
    message2: string
    isRead: boolean
    isDeleted: boolean
}

