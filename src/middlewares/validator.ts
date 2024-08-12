import {Request, Response,NextFunction } from 'express'
import { ObjectSchema } from "joi"

const validateRequest = (schema: ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body)
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.details[0].message,
      })
    }
    return next()
  }
}

export default validateRequest
















// import { validationResult } from 'express-validator'
// const validator = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     let errors = validationResult(req)
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() })
//     }
//     return next()
//   } catch (error: any) {
//     logger.error(`validator error: ${error.message}`)
//     return res.status(500).json({ errors: [{ msg: error.message }] })
//   }
// }

// export default validator

