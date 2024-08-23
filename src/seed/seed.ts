import { sendMail } from '../../src/utils/sendMail'
import * as userService from '../../src/modules/user/user.service'
import logger from '../../src/utils/logger'
import { CONSTANTS } from '../../src/utils/constants'
import Permissions from '../../src/modules/rolePermissions/rolePermissions.model'
import sendOTP from '../../src/utils/sendOtp'
import { IUser } from '../../src/modules/user/user.interface'

const seed = async (): Promise<IUser | void> => {
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

    const text = `Your OTP is ${adminCredentials?.otp} \n
      http://localhost:3000/api/v1/user/verifyMail`

    const subject = 'Email verification mail'

    const html = `<div
    class="container"
    style="max-width: 90%; margin: auto; padding-top: 20px"; justify-content: center; align-content: center>
    <h2>Welcome to the club.</h2>
    <h4>You are officially In ✔</h4>
    <p style="margin-bottom: 30px;">Pleas enter the sign up OTP to get started</p>
    <h1 style="font-size: 20px; letter-spacing: 2px; text-align:center;">${text}</h1>
</div>`

    sendMail(adminCredentials?.email as string,subject,text, html)

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
