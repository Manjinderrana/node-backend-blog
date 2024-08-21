import { Request, Response } from 'express'
import * as blogService from '../blogs/blog.service'
import * as userService from '../user/user.service'
import * as commentService from '../comments/comment.service'
import * as likeService from '../likes/like.service'
import * as rolePermissionsService from '../rolePermissions/rolePermissions.service'
import * as userBlogRolePermissionService from '../userBlogRolePermissions/UserBlogRolePermissions.service'
import { UserRequest, customInterface } from '../../utils/interface'
import { ApiError } from '../../utils/error'
import { ApiResponse } from '../../utils/response'
import { ObjectId } from 'mongoose'
import { convertToObjectId } from '../../utils/convertToObjectId'
import sendNotifications from '../../utils/notifications'
import { IBlog } from './blog.interface'
import * as notificationService from '../../modules/notifications/notification.service'
import wrap from '../../utils/asyncHandler'
import logger from '../../utils/logger'
import { CONSTANTS } from '../../utils/constants'
import * as executeAggregations from '../../utils/executeAggregation'

const controller = {
  createBlog: wrap(async (req: Request, res: Response): Promise<Response> => {
    const { title, description } = req.body
    const image = req?.file?.filename
    const blog = await blogService.createBlog({
      image,
      title,
      description,
      members: [
        {
          memberId: (req as UserRequest)?.user?._id,
          role: 'ADMIN',
        },
      ],
      author: (req as UserRequest)?.user?._id,
    })

    const user = await userService.findOne((req as UserRequest)?.user?._id, '_id username email blogs role')

    if (user) {
      user?.blogs?.push(blog?._id)
    }

    await user?.save()

    const [rolePermission] = await rolePermissionsService.aggregate([{ $match: { roleName: CONSTANTS.ROLES.ADMIN, isDeleted: { $ne: true } } }])

    await userBlogRolePermissionService.create({
      userId: (req as UserRequest)?.user?._id,
      blogId: blog?._id,
      roleName: rolePermission?.roleName,
      permissions: rolePermission?.permissions,
    })

    await notificationService.createNotification({
      userId: (req as UserRequest)?.user?._id,
      blogId: blog?._id,
      message1: `${user?.username} created a blog ${blog?.title}`,
    })

    return res.status(201).json(new ApiResponse(201, blog, 'Blog created successfully'))
  }),

  addComment: wrap(async (req: Request, res: Response): Promise<Response> => {
    const { commentString } = req.body

    const { blogId } = req.params

    const commentedBy: ObjectId = (req as UserRequest).user?._id

    const username = ((req as UserRequest)?.user?.username).toUpperCase()

    if (!commentString || typeof commentString !== 'string') {
      throw new ApiError(400, 'Invalid comment string')
    }

    const blog = await blogService.getBlog({ _id: blogId }, '_id title description author')

    if (blog)
      await commentService.createComment({
        commentedBy,
        commentString: `${username} added a comment : ${commentString}`,
        blogId,
      })

    const [commentsOnBlogs] = await blogService.aggregate([
      {
        $match: { _id: convertToObjectId(blogId) },
      },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'blogId',
          as: 'blogComments',
        },
      },
      {
        $addFields: {
          commentsData: '$blogComments',
        },
      },
      {
        $project: {
          _id: 1,
          image: 1,
          title: 1,
          description: 1,
          commentsData: 1,
        },
      },
    ])

    const comments = commentsOnBlogs?.commentsData?.map((ele: customInterface) => {
      return ele.commentString
    })

    await sendNotifications(
      (req as UserRequest).user?._id,
      blogId as unknown as ObjectId,
      `${username} added a comment ${commentString} to the blog ${blog?.title}`,
      `${username} commented on your blog ${blog?.title}`,
    )

    return res.status(200).json(new ApiResponse(200, { data: blog, comments }, 'comment added successfully'))
  }),

  likeBlog: wrap(async (req: Request, res: Response): Promise<Response | void> => {
    const { blogId } = req.params

    const AlreadyLiked = await likeService.findOne({ likedBy: (req as UserRequest)?.user?._id })

    const blog = (await blogService.getBlog({ _id: blogId }, '_id title description author')) as IBlog

    if (!AlreadyLiked) {
      await likeService.create({
        likedBy: (req as UserRequest)?.user?._id,
        blogId: blogId,
      })

      let message1 = `${(req as UserRequest)?.user?.username} liked a blog ${blog?.title}`
      let message2 = `${(req as UserRequest)?.user?.username} liked your Blog ${blog?.title}`

      await sendNotifications((req as UserRequest)?.user?._id, blogId as unknown as ObjectId, message1, message2)

      io.to((req as UserRequest)?.user?._id?.toString()).emit('notification', JSON.stringify(`Blog ${blog?.title} added to liked blogs`))

      await sendNotifications(blog?.author as ObjectId, blogId as unknown as ObjectId, message2)

      return res.status(200).json(new ApiResponse(200, {}, 'blog liked successfully'))
    } else {
      let message1 = `${(req as UserRequest)?.user?.username} liked a blog ${blog?.title}`
      let message2 = `${(req as UserRequest)?.user?.username} liked your Blog ${blog?.title}`

      const arr: string[] = []

      arr.push(message1)
      arr.push(message2)

      const promise = arr.map((ele: string) => {
        return notificationService.deleteNotification({ message: ele })
      })

      await Promise.all(promise)

      await sendNotifications((req as UserRequest)?.user?._id, blogId as unknown as ObjectId, `Like removed from blog ${blog?.title}`)

      await likeService.deleteLike({ likedBy: (req as UserRequest)?.user?._id }, { blogId: blogId })
    }

    return res.status(200).json(new ApiResponse(200, {}, 'blog liked removed successfully'))
  }),

  dislikeBlog: wrap(async (req: Request, res: Response): Promise<Response | void> => {
    const { blogId } = req.query

    const blog = await likeService.findOne({ blogId: blogId })

    if (blog) {
      await likeService.deleteLike({ blogId }, { blogId: blogId })
      await notificationService.createNotification({
        userId: (req as UserRequest)?.user?._id,
        blogId: blogId as unknown as ObjectId,
        message1: 'Blog added to disliked blogs',
      })

      return res.status(200).json(new ApiResponse(200, {}, 'blog disliked successfully'))
    }

    await notificationService.createNotification({
      userId: (req as UserRequest)?.user?._id,
      blogId: blogId as unknown as ObjectId,
      message1: 'Blog added to disliked blogs',
    })

    return res.status(200).json(new ApiResponse(200, {}, 'blog disliked successfully'))
  }),

  getBlog: wrap(async (req: Request, res: Response): Promise<Response | void> => {
    const { blogId } = req.params

    const blog = await blogService.getBlog({ _id: blogId }, '_id title description author')

    if (!blog) {
      throw new ApiError(404, 'Blog not found')
    }

    return res.status(200).json(new ApiResponse(200, blog, 'blog data fetched successfully'))
  }),

  getAllBlogsByUser: wrap(async (req: Request, res: Response): Promise<Response | void> => {
    const { skip, limit } = req.query

    const userId = (req as UserRequest)?.user?._id

    const { blogs, count, unreadCount } = await blogService.getAllBlogsByUser(userId, Number(skip), Number(limit))

    return res.status(200).json(new ApiResponse(200, { count, unreadCount, blogs }, 'Blog data fetched successfully'))
  }),

  getAllBlogs: wrap(async (req: Request, res: Response): Promise<Response | void> => {
    const { skip = 0, limit = 0 } = req.query

    const { count, unreadCount, all } = await blogService.getAllBlogs({}, Number(skip), Number(limit))

    return res.status(200).json(new ApiResponse(200, { count, unreadCount, all }, 'All Blogs data fetched successfully'))
  }),

  updateBlog: wrap(async (req: Request, res: Response): Promise<Response | void> => {
    const { blogId } = req.params

    if (!blogId) {
      throw new ApiError(400, 'blog not found')
    }

    const { title, description } = req.body

    const authorizedBlogIds = await executeAggregations.authorizedBlogIds((req as UserRequest)?.user?._id, ['BLOG - VIEW_ALL_BLOGS'])

    const authorizedBlog = authorizedBlogIds?.find((ele) => ele?.toString() == blogId?.toString())
    
    if (!authorizedBlog) throw new ApiError(403, "Forbidden")
  
    const blog = await blogService.updateOne(
      {
        $and: [{ _id: { $in: authorizedBlogIds } }, { _id: blogId }],
        isDeleted: { $ne: true },
      },
      {
        title,
        description
      },
      {new: true}
    )
    if (!blog) throw new ApiError(400, "Blog does not exist")
  
    // if (updatedData?.author.toString() !== ((req as UserRequest)?.user?._id).toString()) {
    //   throw new ApiError(401, 'unauthorized access')
    // }

    await sendNotifications(
      (req as UserRequest)?.user?._id,
      blogId as unknown as ObjectId,
      `Blog ${blog?.title} updated by ${(req as UserRequest)?.user?.username}`,
      `Blog ${blog?.title} updated`,
    )

    return res.status(200).json(new ApiResponse(200, {blog}, 'Blog updated successfully'))
  }),

  readBlog: wrap(async (req: userService.customInterface, res: Response): Promise<Response | void> => {
    const { blogId } = req.query

    const author = (req as UserRequest)?.user?._id

    const readBlog = await blogService.updateBlog(
      {
        ...(blogId ? { _id: blogId } : {}),
        author,
      },
      { isRead: true },
      { new: true },
    )

    return res.status(200).json(new ApiResponse(200, readBlog, 'Blog read successfully'))
  }),

  deleteBlog: wrap(async (req: Request, res: Response): Promise<Response | void> => {
    const { blogId } = req.params

    const author = (req as UserRequest)?.user?._id

    await userService.updateOne({ _id: author }, { $pull: { blogs: blogId } }, { new: true })

    const deletedBlog = await blogService.updateBlog(
      {
        _id: blogId,
        author,
      },
      { isRead: true, isDeleted: true },
      { new: true },
    )

    if (deletedBlog?.author?.toString() !== author.toString()) {
      throw new ApiError(401, 'unauthorized access')
    }

    await sendNotifications(
      (req as UserRequest)?.user?._id,
      blogId as unknown as ObjectId,
      `Blog ${deletedBlog?.title} deleted`,
      `Blog ${deletedBlog?.title} deleted by ${(req as UserRequest)?.user?.username}`,
    )

    return res.status(200).json(new ApiResponse(200, { deletedBlog }, 'Blog deleted successfully'))
  }),

  deleteAllBlogs: wrap(async (req: Request, res: Response): Promise<Response | void> => {
    const userId: ObjectId | string = (req as UserRequest)?.user?._id

    const user = await userService.updateOne({ _id: userId }, { blogs: [] }, { new: true })

    if (user) {
      await blogService.updateMany({}, { isRead: true, isDeleted: true }, { new: true })
    }

    return res.status(200).json(new ApiResponse(200, user, 'Blogs deleted Successfully'))
  }),

  getLikesCount: wrap(async (req: Request, res: Response): Promise<Response | void> => {
    const { blogId } = req.params

    const [likes] = await blogService.aggregate([
      {
        $match: { _id: convertToObjectId(blogId) },
      },
      {
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'blogId',
          as: 'likesCount',
        },
      },
      {
        $addFields: {
          likesCount: { $size: '$likesCount' },
        },
      },
      {
        $project: {
          author: 1,
          likesCount: 1,
          title: 1,
          description: 1,
        },
      },
    ])

    return res.status(200).json(new ApiResponse(200, { data: likes }, 'blog liked successfully'))
  }),

  getComments: wrap(async (req: Request, res: Response): Promise<Response | void> => {
    const { blogId } = req.params

    const [comments] = await blogService.aggregate([
      {
        $match: { _id: convertToObjectId(blogId) },
      },
      {
        $lookup: {
          from: 'comments',
          localField: '_id',
          foreignField: 'blogId',
          as: 'blogComments',
        },
      },
      {
        $addFields: {
          commentsData: '$blogComments',
        },
      },
      {
        $project: {
          _id: 1,
          image: 1,
          title: 1,
          description: 1,
          commentsData: 1,
        },
      },
    ])

    const commentStr = comments.commentsData.map((ele: customInterface) => {
      return ele.commentString
    })

    return res.status(200).json(new ApiResponse(200, commentStr, 'blog comments fetched successfully'))
  }),

  watchLater: wrap(async (req: Request, res: Response): Promise<Response | void> => {
    const { blogId } = req.query

    const alreadyWatchLater = (req as UserRequest)?.user?.watchLater?.includes(blogId)

    if (!alreadyWatchLater) {
      ;(req as UserRequest)?.user?.watchLater.push({ _id: blogId })
      await (req as UserRequest)?.user.save()

      return res.status(200).json(new ApiResponse(200, {}, 'Added to watchLater'))
    } else {
      return res.status(200).json(new ApiResponse(200, {}, 'Already added to watchLater'))
    }
  }),

  removeFromWatchLater: wrap(async (req: Request, res: Response): Promise<Response | void> => {
    const { blogId } = req.query

    const alreadyWatchLater = (req as UserRequest)?.user?.watchLater?.includes(blogId)

    if (alreadyWatchLater) {
      ;(req as UserRequest)?.user?.watchLater.splice(blogId)
      await (req as UserRequest)?.user.save()

      return res.status(200).json(new ApiResponse(200, {}, 'Removed from watchLater'))
    }
  }),

  getWatchLaterData: wrap(async (req: Request, res: Response): Promise<Response | void> => {
    const watchLaterData = (req as UserRequest)?.user?.watchLater

    return res.status(200).json(new ApiResponse(200, watchLaterData, 'watchLater data fetched successfully'))
  }),

  universalSearch: wrap(async (req: Request, res: Response): Promise<Response | void> => {
    const query = req.query.q
    const skip = 0
    const limit = 4

    if (!query) {
      throw new ApiError(400, 'search query is required')
    }

    const result = await blogService.find(
      {
        $or: [
          {
            title: { $regex: query, $options: 'i' },
          },
          {
            description: { $regex: query, $options: 'i' },
          },
        ],
      },
      '_id image title description author',
      skip as number,
      limit as number,
    )

    if (result?.length === 0) {
      throw res.status(404).json(new ApiError(404, 'No search results found'))
    }

    return res.status(200).json(new ApiResponse(200, { result }, 'Search data fetched successfully'))
  }),

  likeComment: wrap(async (req: Request, res: Response): Promise<Response | void> => {
    const { commentId } = req.query

    const comment = await commentService.getComment({ _id: commentId })

    if (!comment) {
      throw new ApiError(404, 'Comment not found')
    }

    const alreadyLiked = comment?.likedBy.includes((req as UserRequest)?.user?._id)

    if (!alreadyLiked) {
      comment?.likedBy.push((req as UserRequest)?.user?._id)
      await comment?.save()
      return res.status(200).json(new ApiResponse(200, {}, 'Comment liked successfully'))
    } else {
      comment?.likedBy.splice((req as UserRequest)?.user?._id)
      await comment?.save()
    }

    return res.status(200).json(new ApiResponse(200, {}, 'Comment unLiked successfully'))
  }),

  getBlogsFromUser: wrap(async (req: Request, res: Response): Promise<Response | void> => {
    const { username } = req.query

    const user = await userService.findOne({ username }, 'blogs')

    if (!user) {
      throw new ApiError(404, 'User not found')
    }

    const BlogData = await Promise.all(
      user?.blogs?.map((blogId: any) => {
        return blogService.getBlog(blogId as ObjectId, '_id image title description author isDeleted isRead')
      }),
    )

    return res.status(200).json(new ApiResponse(200, { BlogData }, 'Users blogs fetched successfully'))
  }),

  getBlogByFilter: wrap(async (req: Request, res: Response): Promise<Response | void> => {
    const { days } = req.query

    const date30DaysAgo = new Date()
    date30DaysAgo.setDate(date30DaysAgo.getDate() - (Number(days) || 1))

    const filteredData = await blogService.find({ createdAt: { $gte: date30DaysAgo } }, '-members', 0, 0)

    if (filteredData?.length === 0) {
      logger.error('data does not exist')
      return res.status(400).json(new ApiError(404, 'Data not found'))
    }

    return res.status(200).json(new ApiResponse(200, { filteredData }, 'Data fetched successfully'))
  }),
}

export default controller
