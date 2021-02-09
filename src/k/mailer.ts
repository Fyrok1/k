import nodemailer, { Transporter } from 'nodemailer'
import { MailOptions } from 'nodemailer/lib/sendmail-transport';

export const Mailer = new class{
  constructor(){
    if (process.env.MAILER == "1") {
      this.transporter = nodemailer.createTransport({
        host: String(process.env.MAILER_HOST),
        port: Number(process.env.MAILER_PORT),
        secure: process.env.MAILER_SECURE=="1", // true for 465, false for other ports
        auth: {
          user: process.env.MAILER_USER, 
          pass: process.env.MAILER_PASS, 
        },
      });
    }
  }

  private transporter:Transporter;

  async send(mail:MailOptions){
    return new Promise(async(resolve,reject)=>{
      try {
        const info = await this.transporter.sendMail(mail)
        resolve(info)
      } catch (error) {
        reject(error)
      }
    })
  }
}