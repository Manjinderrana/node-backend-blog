import { PipelineStage } from 'mongoose'
import { IBlogRolePermissions } from './userBlogRolePermissions.interface'
import UserBlogRolePermissions from './userBlogRolePermissions.model'
import { customInterface } from '../user/user.service'

export const create = async (data: Partial<IBlogRolePermissions>) => {
  return (await UserBlogRolePermissions.create(data)).toJSON()
}

export const findOne = async (data: Partial<IBlogRolePermissions>) => {
  return await UserBlogRolePermissions.findOne(data)
}

export const updateOne = async (data: Partial<IBlogRolePermissions>, UpdateQuery: customInterface) => {
  return await UserBlogRolePermissions.updateOne(data, UpdateQuery)
}

export const updateMany = async (serachQuery: Partial<IBlogRolePermissions>, UpdateQuery: customInterface) => {
  return await UserBlogRolePermissions.updateMany(serachQuery, UpdateQuery)
}

export const find = async (data: Partial<IBlogRolePermissions>) => {
  return (await UserBlogRolePermissions.create(data)).toJSON()
}

export const aggregate = async (query: PipelineStage[]) => {
  return await UserBlogRolePermissions.aggregate(query)
}
