import express from "express";
import { Logger } from "./logger";
import { unasignedObject } from "./interfaces";

export function AuthGuard(redirect: unasignedObject | string, auth: string = "user") {
  return async function (req: express.Request, res: express.Response, next: express.NextFunction): Promise<express.Handler> {
    if (req.session.auth && req.session.auth[auth]) {
      next();
    } else {
      if (typeof redirect == "string") {
        res.redirect(redirect);
      } else if (typeof redirect == "object") {
        if (Object.keys(redirect).length == 0) {
          redirect.msg = "Unauthorized"
        }
        res.status(401).json(redirect)
      } else {
        if (req.method == "GET") {
          res.status(401).redirect('/')
        } else {
          res.status(401).send()
        }
      }
    }
    return;
  }
}

export function RedirectOnAuth(redirect: string,auth: string="user") {
  return async function (req: express.Request, res: express.Response, next: express.NextFunction): Promise<express.Handler> {
    if (req.session.auth && req.session.auth[auth]) {
      res.redirect(redirect);
    } else {
      next();
    }
    return;
  }
}

export function Login(req: express.Request, authName:string="user", auth:object={} ):Promise<void>{
  return new Promise<void>((resolve,reject)=>{
    if (!req.session.auth) {
      req.session.auth = {};
    }
    req.session.auth[authName] = auth;
    req.session.save(err=>{
      if (err) {
        reject(err)
      }else{
        resolve()
      }
    })
  })
}

export function Logout(req: express.Request, authName: string = 'user'): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    try {
      delete req.session.auth[authName]
      if (Object.keys(req.session.auth).length === 0 && req.session.auth.constructor === Object) {
        delete req.session.auth
      }
    } catch (error) {
      Logger.error(error)
      reject(error)
    } finally {
      req.session.save((err: Error) => {
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      })
    }
  })
}