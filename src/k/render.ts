import { randomText } from "./functions";
import path from 'path'
import dayjs from 'dayjs'
import ejs from 'ejs';
import fs from 'fs'
import express from 'express'
import { unasignedObject } from "./interfaces";
import app from "./app";

export const RenderGetMethods = (router: express.Router): express.Router => {
  const _get = router.get;
  router.get = function (path: string, ...handlers: express.RequestHandler[]) {
    return _get.call(this, path, ...handlers);
  }
  return router
}

export const RenderMiddleware = () => {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.locals = {
      ...(res.locals ?? {}), ...{
        env: process.env,
        extractScripts: true,
        extractMetas: true,
        extractStyles: true,
        head: null,
        error: null,
        meta: null,
        body: null,
        style: null,
        script: null,
        success: null,
        title: "K",
        _params: {},
        dayjs,
        partial: (filename: string, data = {}, options = {}) => {
          const d = {}
          Object.assign(d, res.locals, data)
          return ejs.render(fs.readFileSync(path.join(path.resolve(), '/src/views/partials/', filename + '.ejs'), 'utf-8'), d, options)
        },
        development: () => {
          return ejs.render(fs.readFileSync(path.join(path.resolve(), '/src/k/views/partials/development.ejs'), 'utf-8'), { ...(res.locals ?? {}) })
        },
        iteration: (i: number, page = 1, pageSize = 25) => {
          return (i + 1) + ((page - 1) * pageSize)
        },
        link: (url: string, lang?: string) => {
          if (url[0] != '/') {
            url = '/' + url;
          }
          if (process.env.MULTI_LANG == "1") {
            if (!lang) {
              lang = req.i18n.language;
            }
            url = path.join('/', lang, url).replace(/\\/g, '/')
          }
          return url;
        },
        _csrf: () => {
          return `<input type="hidden" name="_csrf" value="${req.csrfToken()}">`
        },
        _urlParams: (data: { add?: unknown, blacklist?: string[], whitelist?: Array<string>, pre?} = { add: {}, blacklist: [], whitelist: [], pre: "" }) => {
          let text = ""
          let add = data.add ? data.add : {}
          const blacklist = data.blacklist ?? []
          const whitelist = data.whitelist ?? []
          const pre = data.pre ? data.pre : "";

          const qadd = {};
          Object.assign(qadd, req.query, add);
          add = qadd;
          blacklist.forEach(removeKey => {
            delete add[removeKey]
          })
          if (whitelist.length > 0) {
            Object.keys(add).forEach(key => {
              if (!whitelist.includes(key)) {
                delete add[key]
              }
            })
          }
          Object.keys(add).forEach(key => {
            if (add[key] == "") {
              delete add[key];
            }
          })
          Object.keys(add).forEach(key => {
            if (text != "") {
              text += "&"
            }
            text += key + '=' + add[key];
          })
          if (text.length > 0) {
            text = "?" + text;
          }
          return pre + text
        },
        randomText: randomText
      }
    }

    const _render = res.render;
    res.render = function (view: string, options: object = {}, callback?: (err: Error, html: string) => void) {
      if (!options["layout"] && res.layout) {
        options["layout"] = res.layout;
      }

      if (process.env.NODE_ENV != "production") {
        app.render(view, options, (err, html) => {
          if (err) {
            throw err;
          } else {
            res.KRender.render({
              page: "shell.ejs",
              options: {
                body: html
              }
            })
          }
        })
      } else {
        _render.call(this, view, options, callback);
      }
    }

    next()
  }
}

export const SetLocalsMiddleware = (data: unasignedObject) => {
  return function (req: express.Request, res: express.Response, next: express.NextFunction) {
    res.locals = { ...res.locals, ...data }
    next()
  }
}

export const SetLayoutMiddleware = (layout: string) => {
  return function (req: express.Request, res: express.Response, next: express.NextFunction) {
    res.layout = layout;
    next();
  }
}

export const RenderAngularAppFile = (appName: string) => {
  return async (req: express.Request, res: express.Response) => {
    res.layout = null;
    if (req.originalUrl.indexOf('.') == -1 && req.originalUrl[req.originalUrl.length - 1] != "/") {
      res.redirect(req.originalUrl + '/')
    } else if (req.url == `/`) {
      const filePath = path.join(path.resolve(), 'dist/' + appName + '/index.html')
      if (fs.existsSync(filePath)) {
        if (process.env.NODE_ENV == "production") {
          res.sendFile(filePath)
        } else {
          const body = fs.readFileSync(filePath, "utf-8")
          res.render('layouts/k/app-shell', {
            body
          })
        }
      } else {
        res.status(404).send()
      }
    } else {
      const filePath = path.join(path.resolve(), 'dist/' + appName + '/' + req.url);
      if (fs.existsSync(filePath)) {
        res.sendFile(path.join(path.resolve(), 'dist/' + appName + '/' + req.url))
      } else {
        res.status(404).send()
      }
    }
    return;
  }
}

export const RenderAngularApp = (appName: string): express.Router => {
  return express.Router()
    .get('*', RenderAngularAppFile(appName))
}