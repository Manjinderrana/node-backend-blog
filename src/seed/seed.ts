import { sendMail } from '../../src/utils/sendMail'
import * as userService from '../../src/modules/user/user.service'
import logger from '../../src/utils/logger'
import { encryptAccessToken } from '../../src/utils/jwtUtils'
import { CONSTANTS } from '../../src/utils/constants'
import Permissions from '../../src/modules/rolePermissions/rolePermissions.model'

const seed = async (): Promise<any> => {
  try {
    const adminCredentials = {
      username: process.env.ADMIN_NAME,
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: CONSTANTS.ROLES.ADMIN,
    }

    const existingAdmin = await userService.findOne(
      { $and: [{ email: adminCredentials.email }, { role: CONSTANTS.ROLES.ADMIN }] },
      '_id username email role',
    )

    let admin: any
    if (!existingAdmin) {
      admin = await userService.create(adminCredentials)

      const token = encryptAccessToken(admin)

      const text = `Please click this link to verify your email, http://localhost:3000/api/v1/user/verifyMail/${token}`

      const subject = 'Email verification mail'

      sendMail({
        email: adminCredentials?.email,
        subject,
        text,
      })

      logger.info('Admin created successfully')

      return admin
    } else {
      logger.info('Admin already exists')
    }

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
  } catch (error) {
    logger.info('Admin user already exists')
  }
}

export default seed
