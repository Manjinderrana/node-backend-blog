import nodemailer from 'nodemailer'
import { ApiError } from './error'

export const sendMail = async (email: string, subject: string, text: string, html: string) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      secure: true,
      auth: {
        user: process.env.EMAIL_ADDRESS,
        pass: process.env.EMAIL_PASSWORD,
      },
    })

    await transporter.sendMail({
      from: 'manjindersingh',
      to: email,
      subject: subject,
      text: text,
      html: html,
    })
  } catch (error: any) {
    throw new ApiError(error.status, `Error in sending mail:${error.message}`)
  }
}
