import Joi from 'joi'
import { Types } from 'mongoose'

export const JoiObjectId = Joi.extend((joi) => ({
  type: 'objectId',
  base: joi.string(),
  messages: {
    'objectId.invalid': '{{#label}} must be a valid ObjectId',
  },
  validate(value, helpers) {
    if (!Types.ObjectId.isValid(value)) {
      return { value, errors: helpers.error('objectId.invalid') }
    }

    return { value: new Types.ObjectId(value) }
  },
}))

export const JoiObjectIdList = Joi.extend((joi) => ({
  type: 'objectIdList',
  base: joi.string(),
  messages: {
    'objectIdList.invalid': 'Invalid ObjectId list format',
  },
  validate(value, helpers) {
    try {
      const ids = value.split(',').map((id: string) => id.trim())
      const schema = Joi.array().items(JoiObjectId.objectId())
      const { error, value: validatedIds } = schema.validate(ids)
      if (error) throw error
      return { value: validatedIds }
    } catch (err) {
      return helpers.error('objectIdList.invalid')
    }
  },
}))

export const JoiParse = Joi.extend((joi) => ({
  type: 'string',
  base: joi.string(),
  messages: {
    'json.parse': '{{#label}} must be a valid JSON string',
    'json.schema': '{{#label}} failed validation against schema: {{#message}}',
  },
  rules: {
    parse: {
      method(schema) {
        return this.$_addRule({ name: 'parse', args: { schema } })
      },
      validate(value, helpers, args) {
        let parsedValue
        try {
          parsedValue = JSON.parse(value)
        } catch (e) {
          return helpers.error('json.parse')
        }

        const { error, value: parsedValue1 } = args.schema.validate(parsedValue)
        if (error) {
          return helpers.error('json.schema', { message: error.details[0].message })
        }

        return parsedValue1
      },
    },
  },
}))
