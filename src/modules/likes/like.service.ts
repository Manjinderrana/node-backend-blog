import { customInterface } from '../user/user.service'
import { ILikes } from './like.interface'
import Like from './like.model'

export const create = async (data: Partial<ILikes>) => {
  return (await Like.create(data)).toJSON()
}

export const findOne = async (searchQuery: customInterface) => {
  return await Like.findOne(searchQuery).populate('blogId')
}

export const update = async (searchQuery: Partial<ILikes>, updateQuery: Partial<ILikes>) => {
  return await Like.updateOne(searchQuery, updateQuery)
}

export const deleteLike = async (searchQuery: customInterface, deleteQuery: customInterface) => {
  return await Like.deleteOne(searchQuery, deleteQuery)
}
