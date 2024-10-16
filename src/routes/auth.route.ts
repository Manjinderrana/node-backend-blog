import { Router } from 'express'
import { login, logout, reSendOTP, refreshController, register, verifyMail } from '../modules/auth/auth.controller'
import { verifyJwt } from '../middlewares/verifyJwt'
import validateRequest from '../middlewares/validator'
import { signup, loginUser, verifyEmail } from '../modules/auth/auth.validation'

const authRouter = Router()

authRouter.route('/signup').post(validateRequest(signup), register)
authRouter.route('/login').post(validateRequest(loginUser), login)
authRouter.route('/refresh').post(refreshController)
authRouter.route('/verifyMail').post(validateRequest(verifyEmail), verifyMail)
authRouter.route('/logout').post(verifyJwt, logout)
authRouter.route('/reSendOTP').post(reSendOTP)

export default authRouter
