import { Request, Response } from 'express'
import { ApiError } from '../../utils/error'
import bcrypt from 'bcryptjs'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { ApiResponse } from '../../utils/response'
import { UserRequest } from '../../utils/interface'
import * as userService from '../user/user.service'
import { decodeToken, encryptAccessToken, encryptRefreshToken } from '../../utils/jwtUtils'
import redisClient from '../../utils/redisClient'
import { sendMail } from '../../utils/sendMail'
import { IUser } from '../user/user.interface'
import * as notificationService from '../../modules/notifications/notification.service'
import sendOTP from '../../utils/sendOtp'
import { generateAvatarUrl } from '../../utils/generateAvatarUrl'
import wrap from '../../utils/asyncHandler'

export const register = wrap(async (req: Request, res: Response): Promise<void | Response> => {
  const { username, email, password } = req.body as IUser

  if (!(email?.endsWith('@gmail.com') || email?.endsWith('@rgi.ac.in'))) {
    throw new ApiError(403, 'Wrong Domain')
  }

  if (!(username && email && password)) {
    throw new ApiError(400, 'All fields required')
  }

  const existingUser = await userService.findOne({ email }, 'id username email')

  if (existingUser) {
    throw new ApiError(400, 'User already exists')
  }

  const otp = sendOTP()

  const otp_expiration = new Date(Date.now() + 10 * 60 * 1000)

  let firstInitial = ''
  let lastInitial = ''
  let avatarUrl = ''

  const userName = username.split(' ')
  if (userName?.length === 1) {
    firstInitial = userName[0].charAt(0)
    avatarUrl = generateAvatarUrl(`${firstInitial}`)
  } else if (userName && userName?.length >= 2) {
    firstInitial = userName[0].charAt(0)
    lastInitial = userName[1].charAt(0)
    avatarUrl = generateAvatarUrl(`${firstInitial}+${lastInitial}`)
  }

  await userService.create({
    username,
    email,
    avatar: avatarUrl,
    password,
    otp,
    otp_expiration,
  })

  const registeredUser = await userService.findOne({ email }, 'id username email role avatar')

  const Authorization = encryptAccessToken(registeredUser as IUser)

  await notificationService.createNotification({ userId: registeredUser?._id, message1: `${registeredUser?.username} registered successfully` })

  const text = `Your OTP is ${otp} \n
      Please click this link to verify your email, \n
      http://localhost:3000/api/v1/user/verifyMail/${Authorization}`

  const subject = 'Email verification mail'

  sendMail({
    email: registeredUser?.email,
    subject,
    text,
  })

  return res
    .status(201)
    .cookie('accessToken', Authorization)
    .json(new ApiResponse(201, { data: registeredUser, setCookie: Authorization }, 'User Registered Successfully'))
})

export const login = wrap(async (req: Request, res: Response): Promise<Response | void> => {
  const { email, password } = req.body

  const existingUser = await userService.findOne({ email }, 'id username email password isVerified')

  if (!existingUser) {
    throw new ApiError(404, 'user not found')
  }

  if (!existingUser?.isVerified) return res.status(400).json(new ApiResponse(400, {}, 'Your account is not verified'))

  const isPasswordCorrect = await bcrypt.compare(password, existingUser?.password || '')

  if (!isPasswordCorrect) {
    throw new ApiError(401, 'unauthorized access')
  }

  const accessToken = encryptAccessToken(existingUser)

  const refreshToken = encryptRefreshToken(existingUser)

  existingUser.refreshToken = refreshToken

  await existingUser.save()

  const options = {
    httpOnly: true,
    secure: true,
  }

  const loggedInUser = await userService.findOne({ email }, ' id username email role ')

  return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .setHeader('x-refresh-token', refreshToken)
    .json(
      new ApiResponse(
        200,
        {
          loggedInUser,
          accessToken,
          refreshToken,
        },
        'User loggedIn successfully',
      ),
    )
})

export const refreshController = wrap(async (req: Request, res: Response): Promise<void | Response> => {
  const refreshToken = req.cookies?.refreshToken || req.headers['x-refresh-token']

  if (!refreshToken) {
    throw new ApiError(404, 'Refresh token not found')
  }

  const blacklisted = await redisClient.get(refreshToken)

  if (blacklisted) {
    throw new ApiError(401, 'Access denied')
  }

  const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || '') as JwtPayload

  const newAccessToken = jwt.sign({ _id: decoded?._id }, process.env.ACCESS_TOKEN_SECRET || '', { expiresIn: '5m' })

  const currentTime = Math.floor(Date.now() / 1000)

  let newRefreshToken
  if (refreshToken?.exp - currentTime < 3600) {
    newRefreshToken = jwt.sign({ _id: decoded?._id }, process.env.REFRESH_TOKEN_SECRET || '', { expiresIn: '7d' })
    ;(req as UserRequest).user.refreshToken = newRefreshToken
    await (req as UserRequest).user.save()
  }

  const options = {
    httpOnly: true,
    secure: true,
  }

  return res
    .status(200)
    .cookie('accessToken', newAccessToken, options)
    .json(
      new ApiResponse(
        200,
        {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
        'Token Refreshed Successfully',
      ),
    )
})

export const verifyMail = wrap(async (req: Request, res: Response): Promise<void | Response> => {
  const { otp } = req.body as Partial<IUser>

  const user = await userService.findOne({ otp }, '_id username email otp otp_expiration')

  if (!user) {
    throw new ApiError(400, 'Invalid OTP')
  }

  if (user?.isVerified === true) throw new ApiError(400, 'User already verified')

  if (user?.otp != otp) throw new ApiError(400, 'Invalid otp')

  if (user?.otp_expiration < new Date(Date.now())) throw new ApiError(400, 'OTP expired')

  user.isVerified = true

  await user.save()

  return res.status(200).json(new ApiResponse(200, { data: user?.isVerified }, 'Email verified successfully'))
})

export const logout = wrap(async (req: Request, res: Response): Promise<void | Response> => {
  const accessToken = req.cookies?.accessToken || req.header('Authorization')?.split(' ').pop()

  const refreshToken = req.cookies?.refreshToken || req.headers['x-refresh-token']

  const accessDecoded = decodeToken(accessToken)

  const refreshDecoded = decodeToken(refreshToken)

  const currentTime = Math.floor(Date.now() / 1000)

  const accessTtl = accessDecoded?.exp - currentTime

  const refreshTtl = refreshDecoded?.exp - currentTime

  await redisClient.set('accessToken', accessToken, { EX: accessTtl })

  await redisClient.set('refreshToken', refreshToken, { EX: refreshTtl })

  await userService.updateOne({ _id: (req as UserRequest)?.user?._id }, { $unset: { refreshToken } }, { new: true })

  const options = {
    httpOnly: true,
    secure: true,
  }

  return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(new ApiResponse(200, {}, 'user logged out successfully'))
})

export const reSendOTP = wrap(async (req: Request, res: Response): Promise<Response | void> => {
  const { email } = req.body

  const existingUser = await userService.findOne({ email }, '_id email otp otp_expiration')

  if (!existingUser) {
    throw new ApiError(404, 'User not found')
  }

  const otp = sendOTP()
  const otp_expiration = new Date(Date.now() + 10 * 60 * 1000)

  existingUser.otp = otp
  existingUser.otp_expiration = otp_expiration

  await existingUser?.save()

  const text = `Your OTP is ${otp} \n
    Please click this link to verify your email, \n
    http://localhost:3000/api/v1/user/verifyMail`

  const subject = 'Email verification mail'

  sendMail({
    email: existingUser?.email,
    subject,
    text,
  })

  return res.status(200).json(new ApiResponse(200, { data: existingUser }, 'OTP resend successfully'))
})
