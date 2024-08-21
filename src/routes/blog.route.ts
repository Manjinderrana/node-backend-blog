import { Router } from 'express'
import controller from '../../src/modules/blogs/blog.controller'
import multerMiddleWare from '../../src/middlewares/multer'
import permission from '../../src/middlewares/permissions'

const blogrouter = Router()

blogrouter.route('/create').post(multerMiddleWare.single('image'), controller.createBlog)
blogrouter.route('/get/:blogId').get(permission(['USER', 'MAINTAINER', 'ADMIN']), controller.getBlog)
blogrouter.route('/getAll').get(permission(['USER', 'MAINTAINER', 'ADMIN']), controller.getAllBlogsByUser)
blogrouter.route('/getUserBlog').get(permission(['USER', 'MAINTAINER', 'ADMIN']), controller.getBlogsFromUser)
blogrouter.route('/All').get(permission(['ADMIN']), controller.getAllBlogs)
blogrouter.route('/update/:blogId').patch(permission(['MAINTAINER', 'ADMIN', 'USER']), controller.updateBlog)
blogrouter.route('/read').put(permission(['MAINTAINER', 'ADMIN', 'USER']), controller.readBlog)
blogrouter.route('/delete/:blogId').put(permission(['MAINTAINER', 'ADMIN', 'USER']), controller.deleteBlog)
blogrouter.route('/deleteAll').put(permission(['ADMIN']), controller.deleteAllBlogs)
blogrouter.route('/addcomment/:blogId').post(permission(['USER', 'MAINTAINER', 'ADMIN']), controller.addComment)
blogrouter.route('/like/:blogId').patch(permission(['USER', 'MAINTAINER', 'ADMIN']), controller.likeBlog)
blogrouter.route('/dislike').patch(controller.dislikeBlog)
blogrouter.route('/count/:blogId').get(permission(['USER', 'MAINTAINER', 'ADMIN']), controller.getLikesCount)
blogrouter.route('/comment/:blogId').get(permission(['USER', 'MAINTAINER', 'ADMIN']), controller.getComments)
blogrouter.route('/getwatchlater').get(permission(['USER', 'MAINTAINER', 'ADMIN']), controller.getWatchLaterData)
blogrouter.route('/search').get(controller.universalSearch)
blogrouter.route('/filteredBlogs').get(controller.getBlogByFilter)
blogrouter.route('/likeComment').post(permission(['USER', 'MAINTAINER', 'ADMIN']), controller.likeComment)

export default blogrouter
