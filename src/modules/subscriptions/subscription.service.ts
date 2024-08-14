import { customInterface } from '../user/user.service'
import { ISubscription } from './subscription.interface'
import Subscription from './subscription.model'

export const create = async (data: Partial<ISubscription>) => {
  return (await Subscription.create(data)).toJSON()
}

export const getOne = async (searchQuery: customInterface) => {
  return await Subscription.findOne(searchQuery)
}

export const deleteOne = async (deleteQuery: customInterface) => {
  return await Subscription.deleteOne(deleteQuery)
}

export const update = async (searchQuery: customInterface, deleteQuery: customInterface) => {
  return await Subscription.findByIdAndUpdate(searchQuery, deleteQuery)
}
