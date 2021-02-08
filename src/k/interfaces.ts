/* eslint-disable @typescript-eslint/no-explicit-any */

declare module "express"{
  export interface Request extends Express.Request{
    session?:{
      ratelimitter?:{
        count:number,
        time:number
      },
      [key: string]: any
    },
    i18n?:any
  }
  export interface Response extends Express.Response{
    layout?:string
  }
}

export interface unasignedObject{ [key: string]: any }


export interface IHttpConfig {
  headers:Object,
  uploadFileSizeLimit:number,
  requestSizeLimit:number
}