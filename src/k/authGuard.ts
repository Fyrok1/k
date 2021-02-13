import express from "express";
import { Logger } from "./logger";
import { unasignedObject } from "./interfaces";

export function AuthGuard(auth: string, redirect: unasignedObject | string) {
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

export function RedirectOnAuth(auth: string, redirect: string) {
  return async function (req: express.Request, res: express.Response, next: express.NextFunction): Promise<express.Handler> {
    if (req.session.auth && req.session.auth[auth]) {
      res.redirect(redirect);
    } else {
      next();
    }
    return;
  }
}

export function Logout(req: express.Request, auth: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    try {
      delete req.session.auth[auth]
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

export function CheckAuthority(authorityId: number, authName: string | null = null) {
  return async function (req: express.Request, res: express.Response, next: express.NextFunction): Promise<express.Handler> {
    try {
      let authorities
      if (authName) {
        authorities = req.session.auth[authName].authorities
      } else {
        authorities = req.session.authorities
      }
      if (authorities.includes(authorityId)) {
        next()
      } else {
        res.status(400).send({ alert: "Bu işlem için yetkiniz yok" })
      }
    } catch (e) {
      res.status(400).send({ alert: "Bu işlem için yetkiniz yok" })
    }
    return;
  }
}