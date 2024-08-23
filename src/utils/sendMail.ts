import nodemailer from 'nodemailer'
import { ApiError } from './error'
// import path from "path"
// import fs from "fs"
// import ejs from "ejs"

export const sendMail = async (email: string, subject: string, text: string,html: string) => {
  try {
    // if (!Maildata?.email) return
    // const templatePath = path.resolve("Templates", Maildata.HTMLtemplate)

    // const template = fs.readFileSync(templatePath, { encoding: "utf8" })

    // const html = ejs.render(template, Maildata)

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
      html: html
    })
  } catch (error: any) {
    throw new ApiError(error.status, `Error in sending mail:${error.message}`)
  }
}
