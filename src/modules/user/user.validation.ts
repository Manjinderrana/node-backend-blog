import Joi from "joi"
import * as JoiExtensions from "../../middlewares/joiExtensions"

export const forgotPasswordValidate = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
})

export const resetPasswordValidate = Joi.object({
  token: Joi.string().required(),
  password: Joi.string()
    .messages({ "string.pattern.base": "Please enter a valid password" })})

export const changePasswordValidate = Joi.object({
    newPassword: Joi.string().required()
        .messages({ "string.pattern.base": "Please enter a valid password" }),
    confirmNewPassword: Joi.string().required()
        .messages({ "string.pattern.base": "Please enter a valid password" }),
})

export const updateUserValidate = Joi.object({
    username: Joi.string().trim().required().min(3).max(20),
    email: Joi.string().trim().lowercase().email().required(),
})

export const subscribeValidate = Joi.object({
    username: Joi.string().trim().required(),
})

export const getChannelInfoValidate = Joi.object({
    username: Joi.string().trim().required(),
})

export const watchLaterValidate = Joi.object({
    blogId: JoiExtensions.JoiObjectId.objectId(),
})

export const watchHistoryValidate = Joi.object({
    skip: Joi.number().default(0),
    limit: Joi.number().default(0),
})

export const removeFromWatchHistoryValidate = Joi.object({
    blogId: JoiExtensions.JoiObjectId.objectId(),
})
