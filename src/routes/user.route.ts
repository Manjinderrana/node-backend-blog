import validateRequest from '../middlewares/validator'
import { permission } from '../middlewares/permissions'
import {
  changePassword,
  forgotPassword,
  getAllUsers,
  getChannelInfo,
  removeFromWatchHistory,
  resetPassword,
  subscribe,
  updateUser,
  watchHistory,
  watchLater,
} from '../modules/user/user.controller'
import { Router } from 'express'
import {
  changePasswordValidate,
  forgotPasswordValidate,
  removeFromWatchHistoryValidate,
  resetPasswordValidate,
  watchHistoryValidate,
  watchLaterValidate,
} from '../modules/user/user.validation'
const router = Router()

router.route('/changePassword/:id').patch(validateRequest(changePasswordValidate), changePassword)
router.route('/updateDetails/:id').patch(updateUser)
router.route('/getAllUsers').get(permission(['ADMIN']), getAllUsers)
router.route('/subscribe').post(subscribe)
router.route('/channelInfo').get(getChannelInfo)
router.route('/watchLater').post(validateRequest(watchLaterValidate), watchLater)
router.route('/watchHistory').get(validateRequest(watchHistoryValidate), watchHistory)
router.route('/remove').patch(validateRequest(removeFromWatchHistoryValidate), removeFromWatchHistory)
router.route('/forgot-Password').post(validateRequest(forgotPasswordValidate), forgotPassword)
router.route('/reset-Password/:token').patch(validateRequest(resetPasswordValidate), resetPassword)

export default router
