import { ObjectId } from "mongoose";


export interface IComment {
    _id: ObjectId | string
    commentedBy: ObjectId | string
    commentString: string
    blogId: ObjectId | string
    likedBy: (ObjectId | string) []
}