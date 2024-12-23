import { sendMail } from '../utils/sendMail'
import * as userService from '../modules/user/user.service'
import logger from '../utils/logger'
import { CONSTANTS } from '../utils/constants'
import Permissions from '../modules/rolePermissions/rolePermissions.model'
import sendOTP from '../utils/sendOtp'
import { IUser } from '../modules/user/user.interface'
import * as notificationService from '../modules/notifications/notification.service'
import cron from 'node-cron'
import { monthAgo } from '../utils/date'

const seed = async (): Promise<IUser | void> => {

  cron.schedule('0 0 */30 * *', async () => {
    try {
      const deleted = await notificationService.deleteMany({ $and: [{ createdAt: { $lte: monthAgo } }, { isRead: true }] })
      deleted?.deletedCount > 0 ? logger.info('Notification deleted successfully 30 days ago') : logger.info('No Notifications to delete')
    } catch (error: any) {
      logger.error(`Error while deleting notification: ${error?.stack}`)
    }
  })
  
  const adminCredentials: Partial<IUser> = {
    username: process.env.ADMIN_NAME,
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    role: CONSTANTS.ROLES.ADMIN,
    otp: sendOTP(),
    otp_expiration: new Date(Date.now() + 10 * 60 * 1000),
  }

  const existingAdmin = await userService.findOne(
    { $and: [{ email: adminCredentials.email }, { role: CONSTANTS.ROLES.ADMIN }] },
    '_id username email role',
  )

  let admin: IUser
  if (!existingAdmin) {
    admin = await userService.create(adminCredentials)

    const text = `Your OTP is ${adminCredentials?.otp} <br>`

    const subject = 'Email verification mail'

    const html = `<div
    class="container"
    style="max-width: 90%; margin: auto; padding-top: 20px"; justify-content: center; align-content: center>
    <h2>Welcome to the club.</h2>
    <h4>You are officially In ✔</h4>
    <p style="margin-bottom: 30px;">Please enter the sign up OTP to get started</p>
    <p style="margin-bottom: 30px;">${text}</p>
    <button><div class="jumbotron text-center text-primary">
    <a href="http://localhost:3000/api/v1/user/verifyMail" class="btn btn-danger"><span class="fa fa-google"></span>Click here</a></button>
    </div>`

    sendMail(adminCredentials?.email as string, subject, text, html)

    logger.info('Admin created successfully')

    const rolePermissionsCount = await Permissions.countDocuments({})
    if (rolePermissionsCount || !process.env.SEED) return

    const insertRolePermissions = []

    const userPermissions = CONSTANTS.PERMISSIONS.USER_PERMISSIONS.map((ele) => {
      return `${ele?.TYPE} - ${ele?.PERMISSION}`
    })
    insertRolePermissions.push({ roleName: 'USER', permissions: userPermissions })

    const maintainerPermissions = CONSTANTS.PERMISSIONS.MAINTAINER_PERMISSIONS.map((ele) => {
      return `${ele?.TYPE} - ${ele?.PERMISSION}`
    })
    insertRolePermissions.push({ roleName: 'MAINTAINER', permissions: maintainerPermissions })

    const adminPermissions = CONSTANTS.PERMISSIONS.ADMIN_PERMISSIONS.map((ele) => {
      return `${ele?.TYPE} - ${ele?.PERMISSION}`
    })
    insertRolePermissions.push({ roleName: 'ADMIN', permissions: adminPermissions })

    await Permissions.insertMany(insertRolePermissions)
    return admin
  } else {
    logger.info('Admin already exists')
  }
}

export default seed
