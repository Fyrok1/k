import Logs from "../models/logs.model"

export const Log = new class{
  create=(data:LogCreate={message:"",ip:"system"})=>{
    data.message = data.message ? data.message : "Default Message" 
    data.ip = data.ip ? data.ip : "System"
     
    if (process.env.NODE_ENV == "development") {
      console.log(data.message)
    }
    Logs.create({
      message:data.message,
      ip:data.ip
    })
  }
} 

export interface LogCreate{
  message:string,
  ip?:string
}