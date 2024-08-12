import Joi from "joi"

export const loginUser = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string()
    .messages({ "string.pattern.base": "Please enter a valid password" })
    .required()
})

export const signup = Joi.object({
  username: Joi.string().trim().required().min(3).max(20),
  email: Joi.string().trim().lowercase().email().required().min(15),
  password: Joi.string()
    .messages({ "string.pattern.base": "Please enter a valid password" })})

export const verifyEmail = Joi.object({
  otp: Joi.string().required(),
})
