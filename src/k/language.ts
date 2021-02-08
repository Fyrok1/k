import i18next from "i18next"
import i18nextMiddleware from 'i18next-express-middleware'
import Backend from 'i18next-node-fs-backend'
import path from 'path'
import app from "./app"
import express from "express"

export const defaultLanguage = process.env.MULTI_LANG == "1" ? process.env.DEFAULT_LANG : ''
export const supportedLanguges = process.env.MULTI_LANG == "1" ? process.env.SUPPORTED_LANG.split(',') : []

if (process.env.MULTI_LANG == "1") {
  i18next
    .use(Backend)
    .use(i18nextMiddleware.LanguageDetector)
    .init({
      backend: {
        loadPath: path.join(path.resolve(),'/locales/{{lng}}.json'),
      },
      detection: {
        order: ['querystring', 'cookie'],
        caches: ['cookie']
      },
      fallbackLng: defaultLanguage,
      preload: supportedLanguges
    });
  
  app.use(i18nextMiddleware.handle(i18next))
  i18next.reloadResources(supportedLanguges)
}

export const ChangeLanguageMiddleware = (lang:string)=>{
  return async function(req:express.Request,res:express.Response,next:express.NextFunction):Promise<void>{
    req.i18n.changeLanguage(lang,((err:Error)=>{
      req.session.language = lang;
      res.locals._language = lang;
      res.locals._languages = supportedLanguges;
      if(err) console.log(err);
      next()
    }))
  }
}
