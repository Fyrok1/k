/* eslint-disable @typescript-eslint/no-explicit-any */

declare module "express"{
  export interface Request extends Express.Request{
    session:any,
    i18n:any
  }
  export interface Response extends Express.Response{
    layout?:string
  }
}

export interface unasignedObject{ [key: string]: unknown }
