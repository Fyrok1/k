import ejs from "ejs";
import path from "path";
import fs from "fs";
import { Logger } from "./logger";

// checking custom error pages
export let CustomErrors: ICustomErrors = {
  '500': fs.existsSync(path.join(path.resolve('src/views/errors/500.ejs'))),
  '404': fs.existsSync(path.join(path.resolve('src/views/errors/404.ejs'))),
}

export const CheckCustomErrors = async () => {
  CustomErrors = {
    '500': fs.existsSync(path.join(path.resolve('src/views/errors/500.ejs'))),
    '404': fs.existsSync(path.join(path.resolve('src/views/errors/404.ejs'))),
  }
}

export const KViewPath = path.join(__dirname, '/views')

export const KRenderMiddleware = () => {
  return function (req, res, next) {
    res.KRender = {
      async render(renderOptions: KRenderRenderOptions) {
        try {
          const options = {
            ...(res.locals ?? {}),
            ...(renderOptions.options ?? {})
          }
          const layout = renderOptions.layout ?? options.layout;
          delete options.layout

          const page = await ejs.renderFile(path.join(KViewPath, '/pages/', renderOptions.page), options)
          if (layout) {
            const layoutPage = await ejs.renderFile(path.join(KViewPath, '/layouts/', layout), { ...options, body: page })
            res.send(layoutPage)
          } else {
            res.send(page)
          }
        } catch (error) {
          Logger.error(error);
          res.send(error)
        }
      },
      async renderHTML(renderOptions: KRenderRenderHTMLOptions) {
        try {
          const options = {
            ...(res.locals ?? {}),
            ...(renderOptions.options ?? {})
          }
          const layout = renderOptions.layout ?? options.layout;
          delete options.layout

          const page = renderOptions.html;
          if (layout) {
            const layoutPage = await ejs.renderFile(path.join(KViewPath, '/layouts/', layout), { ...options, body: page })
            res.send(layoutPage)
          } else {
            res.send(page)
          }
        } catch (error) {
          Logger.error(error);
          res.send(error)
        }
      },
      renderNotSend(renderOptions: KRenderRenderOptions): Promise<string> {
        return new Promise(async (resolve, reject) => {
          try {
            const options = {
              ...(res.locals ?? {}),
              ...(renderOptions.options ?? {})
            }
            const page = await ejs.renderFile(path.join(KViewPath, '/pages/', renderOptions.page), options)
            if (renderOptions.layout) {
              const layout = await ejs.renderFile(path.join(KViewPath, '/layouts/', renderOptions.layout), { ...options, body: page })
              resolve(<string>layout)
            } else {
              resolve(<string>page)
            }
          } catch (error) {
            Logger.error(error);
            reject(error)
          }
        })
      },
      async error(errorOptions: KRenderErrorOptions) {
        res.status(500)
        if (typeof errorOptions.error == "string") {
          errorOptions.error = new Error(errorOptions.error);
        }
        if (CustomErrors[500]) {
          res.render('errors/500', {
            layout: false,
            ...res.locals,
            ...errorOptions,
          })
        } else {
          try {
            res.KRender.render({
              page: '500.ejs',
              layout: "shell.ejs",
              options: errorOptions
            })
          } catch (error) {
            res.send(error)
          }
        }
      }
    };
    next()
  }
}

export interface IKRender {
  render: (renderOptions: KRenderRenderOptions) => void,
  renderHTML: (renderOptions: KRenderRenderHTMLOptions) => void,
  error: (errorOptions: KRenderErrorOptions) => void,
  renderNotSend: (renderOptions: KRenderRenderOptions) => Promise<string>
}

export interface KRenderRenderOptions {
  page: string,
  layout?: string,
  options?: object,
}

export interface KRenderRenderHTMLOptions {
  html: string,
  layout?: string,
  options?: object,
}

export interface KRenderErrorOptions {
  error: Error | string
}

export interface ICustomErrors {
  "500": boolean,
  "404": boolean,
}