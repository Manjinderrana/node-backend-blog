import {User} from './user.model'
import { IUser, options } from './user.interface'
import { PipelineStage } from 'mongoose'

export const create = async (data: Partial<IUser>) => {
  return (await User.create(data)).toJSON()
}

export const findOne = async (data: customInterface, projection: string) => {
  return await User.findOne(data, projection)
}

export const updateOne = async (data: Partial<IUser>, update: customInterface, options: options) => {
  return await User.updateOne(data, update, options)
}

export const findByIdandUpdate = async (data: Partial<IUser>, update: customInterface, options: options) => {
  return await User.findByIdAndUpdate(data, update, options)
}

export const aggregate = async (query: PipelineStage[]) => {
  return await User.aggregate(query)
}

export const find = async (searchQuery: customInterface, projection: string) => {
  return await User.find(searchQuery ,projection)
  // .populate("blogs")
}

export interface customInterface {
  [key: string]: any
}

