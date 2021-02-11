import Logs from "./models/logs.model"
import { sequelizeStatus } from "./sequelize"

export const Log = new class{
  create=(data:LogCreate={message:"",ip:"system"})=>{
    data.message = data.message ? data.message : "Default Message" 
    data.ip = data.ip ? data.ip : "System"
     
    if (!(process.env.DB=='1' && sequelizeStatus.status)) {
      console.log(data.message)
    }
    
    if (process.env.DB=='1' && sequelizeStatus.status) {
      Logs.create({
        message:data.message,
        ip:data.ip
      })
    }
  }
} 

export interface LogCreate{
  message:string,
  ip?:string
}