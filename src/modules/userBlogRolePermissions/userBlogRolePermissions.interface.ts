import { ObjectId } from "mongoose";

export interface IBlogRolePermissions {
    _id: ObjectId
    roleName: string
    permissions: string
    blogId: ObjectId
    userId: ObjectId
    isDeleted: boolean
}
