import { customInterface } from "../../utils/interface";
import { IComment } from "./comment.interface";
import Comment from "./comment.model";

export const createComment = async (data: Partial<IComment>) => {
    return await Comment.create(data)
}

export const getComment = async (data: customInterface) => {
    return await Comment.findById(data).populate("author")
}
