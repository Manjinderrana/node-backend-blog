import { Router } from 'express'
import { getAllNotifications, markAsRead, removeNotifications } from '../modules/notifications/notification.controller'

const notificationRouter = Router()

notificationRouter.route('/notifications').get(getAllNotifications)
notificationRouter.route('/markAsRead').patch(markAsRead)
notificationRouter.route('/removeNotification').patch(removeNotifications)

export default notificationRouter
