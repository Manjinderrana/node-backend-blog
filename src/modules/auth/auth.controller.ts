import { Request, Response } from 'express'
import { ApiError } from '../../utils/error'
import bcrypt from 'bcryptjs'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { ApiResponse } from '../../utils/response'
import * as userService from '../user/user.service'
import { decodedAccessToken, decodedRefreshToken, encryptAccessToken, encryptRefreshToken } from '../../utils/jwtUtils'
import redisClient from '../../utils/redisClient'
import { sendMail } from '../../utils/sendMail'
import { IUser } from '../user/user.interface'
import * as notificationService from '../../modules/notifications/notification.service'
import sendOTP from '../../utils/sendOtp'
import { generateAvatarUrl } from '../../utils/generateAvatarUrl'
import wrap from '../../utils/asyncHandler'
import { RESPONSE } from '../../utils/constants'

export const register = wrap(async (req: Request, res: Response): Promise<void | Response> => {
  const { username, email, password } = req.body as IUser

  if ([username, email, password].some((field) => field?.trim() === '')) {
    throw new ApiError(400, 'All fields required')
  }

  if (!(email?.endsWith('@gmail.com') || email?.endsWith('@thewitslab.com') || email?.endsWith('@rgi.ac.in'))) {
    throw new ApiError(403, RESPONSE.WRONG_DOMAIN)
  }

  const existingUser = await userService.findOne({ $or: [{ email }, { username }] }, 'id username email')

  if (existingUser) {
    throw new ApiError(400, RESPONSE.USER_WITH_EMAIL_ALREADY_EXISTS)
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

  await notificationService.createNotification({ userId: registeredUser?._id, userMessage: `${registeredUser?.username} registered successfully` })

  const text = `Your OTP is ${otp} \n
      Please click this link to verify your email by entering the otp, \n
      http://localhost:5173/verify-otp`

  const subject = 'Email verification mail'

  const html = `<div
  class="container"
  style="max-width: 90%; margin: auto; padding-top: 20px"; justify-content: center; align-items: center>
  <h2>Welcome to the club.</h2>
  <h4>You are officially In ✔</h4>
  <p style="margin-bottom: 30px;">Pleas enter the sign up OTP to get started</p>
  <h1 style="font-size: 20px; letter-spacing: 2px; text-align:center;">${text}</h1>
</div>`

  sendMail(registeredUser?.email as string, subject, text, html)

  return res
    .status(201)
    .cookie('accessToken', Authorization)
    .json(new ApiResponse(201, { data: registeredUser, setCookie: Authorization }, RESPONSE.USER_REGISTERED_SUCCESSFULLY))
})

export const login = wrap(async (req: Request, res: Response): Promise<Response | void> => {
  const { email, password } = req.body

  const existingUser = await userService.findOne({ email }, '_id username email password isVerified image')

  if (!existingUser) {
    throw new ApiError(404, RESPONSE.USER_DOES_NOT_EXISTS)
  }

  if (!existingUser?.isVerified) return res.status(400).json(new ApiResponse(400, {}, RESPONSE.ACCOUNT_NOT_VERIFIED))

  const isPasswordCorrect = await bcrypt.compare(password, existingUser?.password || '')

  if (!isPasswordCorrect) {
    throw new ApiError(401, RESPONSE.UNAUTHORIZED)
  }

  const accessToken = encryptAccessToken(existingUser)

  const refreshToken = encryptRefreshToken(existingUser)

  const decoded = jwt.decode(refreshToken) as JwtPayload

  await redisClient.set('whitelisted', refreshToken, { EX: decoded?.exp })

  const options = {
    httpOnly: true,
    secure: true,
  }

  const loggedInUser = await userService.findOne({ email }, '_id username email role isVerified')

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
        RESPONSE.USER_LOGGED_IN_SUCCESSFULLY,
      ),
    )
})

export const refreshController = wrap(async (req: Request, res: Response): Promise<void | Response> => {
  const refreshToken = req.cookies?.refreshToken || req.headers['x-refresh-token']

  if (!refreshToken) {
    throw new ApiError(404, 'Refresh token not found')
  }

  const token = await redisClient.get(refreshToken)

  if (token == 'blacklisted') {
    throw new ApiError(401, RESPONSE.ACCESS_DENIED)
  }

  const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || '') as JwtPayload

  const newAccessToken = jwt.sign({ _id: decoded?._id }, process.env.ACCESS_TOKEN_SECRET || '', { expiresIn: '5m' })

  const currentTime = Math.floor(Date.now() / 1000)

  let newRefreshToken: string
  if (refreshToken?.exp - currentTime < 3600) {
    newRefreshToken = jwt.sign({ _id: decoded?._id }, process.env.REFRESH_TOKEN_SECRET || '', { expiresIn: '7d' })
    const decode = decodedAccessToken(newRefreshToken) as JwtPayload
    await redisClient.set('whitelisted', newRefreshToken, { EX: decode?.exp })
    return res
      .status(200)
      .cookie('accessToken', newAccessToken, { httpOnly: true, secure: true })
      .cookie('refreshToken', newRefreshToken, { httpOnly: true, secure: true })
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
  }

  const options = {
    httpOnly: true,
    secure: true,
  }

  return res
    .status(200)
    .cookie('accessToken', newAccessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          accessToken: newAccessToken,
          refreshToken,
        },
        RESPONSE.TOKEN_REFRESHED_SUCCESSFULLY,
      ),
    )
})

export const verifyMail = wrap(async (req: Request, res: Response): Promise<void | Response> => {
  const { otp } = req.body as Partial<IUser>

  const user = await userService.findOne({ otp }, '_id username email otp otp_expiration isVerified')

  if (!user) throw new ApiError(400, RESPONSE.INVALID_OTP)

  if (user?.isVerified === true) throw new ApiError(400, RESPONSE.USER_ALREADY_VERIFIED)

  if (user?.otp != otp) throw new ApiError(400, RESPONSE.INVALID_OTP)

  if (user?.otp_expiration < new Date(Date.now())) throw new ApiError(400, RESPONSE.OTP_EXPIRED)

  user.isVerified = true

  await user.save()

  return res.status(200).json(new ApiResponse(200, user, RESPONSE.EMAIL_VERIFIED))
})

export const logout = wrap(async (req: Request, res: Response): Promise<void | Response> => {
  const accessToken = req.cookies?.accessToken || req.header('Authorization')?.split(' ').pop()

  const refreshToken = req.cookies?.refreshToken || req.headers['x-refresh-token']

  const accessDecoded = decodedAccessToken(accessToken)

  const refreshDecoded = decodedRefreshToken(refreshToken)

  const currentTime = Math.floor(Date.now() / 1000)

  const accessTtl = accessDecoded?.exp - currentTime

  const refreshTtl = refreshDecoded?.exp - currentTime

  await redisClient.set('blacklisted', accessToken, { EX: accessTtl })

  await redisClient.set('blacklisted', refreshToken, { EX: refreshTtl })

  const options = {
    httpOnly: true,
    secure: true,
  }

  return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(new ApiResponse(200, {}, RESPONSE.USER_LOGGED_OUT_SUCCESSFULLY))
})

export const reSendOTP = wrap(async (req: Request, res: Response): Promise<Response | void> => {
  const { email } = req.body

  const existingUser = await userService.findOne({ email }, '_id email otp otp_expiration')

  if (!existingUser) {
    throw new ApiError(404, RESPONSE.USER_NOT_FOUND)
  }

  const otp = sendOTP()
  const otp_expiration = new Date(Date.now() + 10 * 60 * 1000)

  existingUser.otp = otp
  existingUser.otp_expiration = otp_expiration

  await existingUser?.save()

  const text = `Your OTP is ${otp} \n
    Please click this link to verify your email, \n
    http://localhost:5173/verify-otp`

  const subject = 'RESEND OTP MAIL'

  const html = `<div
  class="container"
  style="max-width: 90%; margin: auto; padding-top: 20px"; justify-content: center; align-items: center
>
  <h2>Welcome to the club.</h2>
  <h4>You are officially In ✔</h4>
  <p style="margin-bottom: 30px;">Please enter the OTP to get started</p>
  <h1 style="font-size: 20px; letter-spacing: 2px; text-align:center;">${text}</h1>
</div>`

  sendMail(existingUser?.email, subject, text, html)

  return res.status(200).json(new ApiResponse(200, existingUser, RESPONSE.OTP_RESEND))
})
