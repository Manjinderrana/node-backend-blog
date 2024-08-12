import nodemailer from 'nodemailer'
import { ApiError } from './error'
// import path from "path"
// import fs from "fs"
// import ejs from "ejs"

export const sendMail = async (Maildata: any) => {
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
      to: Maildata.email,
      subject: Maildata.subject,
      text: Maildata.text,
      // html
    })
  } catch (error: any) {
    throw new ApiError(error.status, `Error in sending mail:${error.message}`)
  }
}
