import validateRequest from '../../src/middlewares/validator'
import permission from '../../src/middlewares/permissions'
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
} from '../../src/modules/user/user.controller'
import { Router } from 'express'
import {
  changePasswordValidate,
  forgotPasswordValidate,
  getChannelInfoValidate,
  removeFromWatchHistoryValidate,
  resetPasswordValidate,
  subscribeValidate,
  watchHistoryValidate,
  watchLaterValidate,
} from '../../src/modules/user/user.validation'
const router = Router()

router.route('/changePassword/:id').patch(validateRequest(changePasswordValidate), changePassword)
router.route('/updateDetails/:id').patch(updateUser)
router.route('/getAllUsers').get(permission(['ADMIN']), getAllUsers)
router.route('/subscribe').post(validateRequest(subscribeValidate), subscribe)
router.route('/channelInfo').get(validateRequest(getChannelInfoValidate), getChannelInfo)
router.route('/watchLater').post(validateRequest(watchLaterValidate), watchLater)
router.route('/watchHistory').get(validateRequest(watchHistoryValidate), watchHistory)
router.route('/remove').patch(validateRequest(removeFromWatchHistoryValidate), removeFromWatchHistory)
router.route('/forgot-Password').post(validateRequest(forgotPasswordValidate), forgotPassword)
router.route('/reset-Password/:token').patch(validateRequest(resetPasswordValidate), resetPassword)

export default router
