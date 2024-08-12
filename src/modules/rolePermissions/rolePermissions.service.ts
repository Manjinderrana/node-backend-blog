import { PipelineStage } from 'mongoose'
import RolePermissions from '../../modules/rolePermissions/rolePermissions.model'
import { customInterface } from '../user/user.service'
import { IPermissions } from './rolePermissions.interface'

export const create = async (data: customInterface) => {
  return (await RolePermissions.create(data)).toJSON
}

export const update = async (data: customInterface) => {
  return await RolePermissions.updateOne(data)
}

export const getPermissions = async (data: customInterface) => {
  return await RolePermissions.findOne(data)
}

export const getAllPermissions = async (data: customInterface) => {
  return await RolePermissions.find(data)
}

export const getOnePermission = async (data: Partial<IPermissions>) => {
  return await RolePermissions.findOne(data)
}

export const aggregate = async (data: PipelineStage[]) => {
  return await RolePermissions.aggregate(data)
}
