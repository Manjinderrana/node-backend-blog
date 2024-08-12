import { IBlog, options } from './blog.interface'
import Blog from './blog.model'
import { customInterface } from '../../utils/interface'
import { PipelineStage } from "mongoose"

export const createBlog = async (data: Partial<IBlog>) => {
  return (await Blog.create(data)).toJSON()
}

export const getBlog = async (searchQuery: customInterface, projection: string) => {
  return await Blog.findById(searchQuery, projection)
}

export const getAllBlogsByUser = async (searchQuery: Partial<IBlog>, skip: number, limit: number) => {
  const blogs = await Blog
    .aggregate([
      {
        $match: {author: searchQuery},
      },
      ...(skip || limit
        ? [
            {
              $skip: Number(skip),
            },
            {
              $limit: Number(limit),
            },
          ]
        : []),
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "userData",
            pipeline : [
             {
              $project: {
                "_id": 1,
                "email": 1,
                "username": 1,
              }
            }
          ]
        },
      },
      {
        $unwind: "$userData",
      },
    ])
    .sort({ createdAt: -1 })
    
  const count = await Blog.countDocuments({author: searchQuery})
  const unreadCount = await Blog.countDocuments({ isRead: false, ...({author: searchQuery}) })
  return { blogs , count, unreadCount }
}

export const getAllBlogs = async (searchQuery: Partial<IBlog>, skip: number, limit: number) => {
  const all = await Blog.find({}).skip(skip).limit(limit).populate("author")
  const count = await Blog.countDocuments(searchQuery)
  const unreadCount = await Blog.countDocuments({ isRead: false, ...searchQuery })
  const readCount = await Blog.countDocuments({ isRead: true, ...searchQuery }).populate("author")
  return { all, count, unreadCount, readCount }
}

export const updateBlog = async (searchQuery: customInterface, update: Partial<IBlog>, options: options) => {
  return await Blog.findByIdAndUpdate(searchQuery, update, options)
}

export const updateMany = async (searchQuery: customInterface, update: Partial<IBlog>, options: options) => {
  return await Blog.updateMany(searchQuery, update, options)
}

export const aggregate = async (searchQuery: PipelineStage []) => {
  return await Blog.aggregate(searchQuery)
}

export const find = async (searchQuery: customInterface, projection: string, skip: number, limit: number) => {
  return await Blog.find(searchQuery, projection).skip(skip).limit(limit)
}

export const deleteAllWatchedBlogs = async (searchQuery: customInterface) => {
  return await Blog.updateMany({isRead: true, ...searchQuery})
}

