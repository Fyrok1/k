import ejs from "ejs";
import path from "path";
import fs from "fs";

// checking custom error pages
export const CustomErrors = {
  '500':false && fs.existsSync(path.join(path.resolve('src/views/errors/500.ejs'))),
  '404':false && fs.existsSync(path.join(path.resolve('src/views/errors/404.ejs'))),
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
          const page = await ejs.renderFile(path.join(KViewPath, '/pages/', renderOptions.page), options)
          if (renderOptions.layout) {
            
            const layout = await ejs.renderFile(path.join(KViewPath, '/layouts/', renderOptions.layout), { ...options, body: page })
            res.send(layout)
          } else {
            res.send(page)
          }
        } catch (error) {
          console.error(error);
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
            console.error(error);
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
          res.render('errors/500',{
            layout:false,
            ...res.locals,
            ...errorOptions,
          })          
        }else{
          try {
            res.KRender.render({
              page: '500.ejs',
              layout:"shell.ejs",
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
  error: (errorOptions: KRenderErrorOptions) => void,
  renderNotSend: (renderOptions: KRenderRenderOptions) => Promise<string>
}

export interface KRenderRenderOptions {
  page: string,
  layout?: string,
  options?: object,
}

export interface KRenderErrorOptions {
  error: Error | string
}