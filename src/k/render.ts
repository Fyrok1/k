import { randomText } from './functions';
import path from 'path';
import dayjs from 'dayjs';
import ejs from 'ejs';
import fs from 'fs';
import express from 'express';
import { UnasignedObject } from './interfaces';
import { CustomErrors } from './kRender';
import { Logger } from './logger';

export const RenderGetMethods = (router: express.Router): express.Router => {
  const _get = router.get;
  router.get = function (path: string, ...handlers: express.RequestHandler[]) {
    return _get.call(this, path, ...handlers);
  };
  return router;
};

export const RenderMiddleware = () => {
  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): void => {
    res.locals = {
      ...(res.locals ?? {}),
      ...{
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
        title: 'K',
        _params: {},
        dayjs,
        partial: (filename: string, data = {}, options = {}) => {
          const d = {};
          Object.assign(d, res.locals, data);
          return ejs.render(
            fs.readFileSync(
              path.join(
                path.resolve(),
                '/src/views/partials/',
                filename + '.ejs'
              ),
              'utf-8'
            ),
            d,
            options
          );
        },
        development: () => {
          return ejs.render(
            fs.readFileSync(
              path.join(
                path.resolve(),
                '/src/k/views/partials/development.ejs'
              ),
              'utf-8'
            ),
            { ...(res.locals ?? {}) }
          );
        },
        iteration: (i: number, page = 1, pageSize = 25) => {
          return i + 1 + (page - 1) * pageSize;
        },
        link: (url: string, lang?: string) => {
          if (url[0] != '/') {
            url = '/' + url;
          }
          if (process.env.MULTI_LANG == '1') {
            if (!lang) {
              lang = req.i18n.language;
            }
            url = path.join('/', lang, url).replace(/\\/g, '/');
          }
          return url;
        },
        _csrf: () => {
          return `<input type="hidden" name="_csrf" value="${req.csrfToken()}">`;
        },
        _urlParams: (
          data: {
            add?: unknown;
            blacklist?: string[];
            whitelist?: Array<string>;
            pre?;
          } = { add: {}, blacklist: [], whitelist: [], pre: '' }
        ) => {
          let text = '';
          let add = data.add ? data.add : {};
          const blacklist = data.blacklist ?? [];
          const whitelist = data.whitelist ?? [];
          const pre = data.pre ? data.pre : '';

          const qadd = {};
          Object.assign(qadd, req.query, add);
          add = qadd;
          blacklist.forEach((removeKey) => {
            delete add[removeKey];
          });
          if (whitelist.length > 0) {
            Object.keys(add).forEach((key) => {
              if (!whitelist.includes(key)) {
                delete add[key];
              }
            });
          }
          Object.keys(add).forEach((key) => {
            if (add[key] == '') {
              delete add[key];
            }
          });
          Object.keys(add).forEach((key) => {
            if (text != '') {
              text += '&';
            }
            text += key + '=' + add[key];
          });
          if (text.length > 0) {
            text = '?' + text;
          }
          return pre + text;
        },
        randomText: randomText,
      },
    };

    const _render = res.render;
    res.render = async function (
      view: string,
      options: UnasignedObject = {},
      callback?: (err: Error, html: string) => void
    ) {
      if (!options['layout'] && res.layout) {
        options['layout'] = res.layout;
      }
      res.locals._rendered = true;

      Logger.info(`RENDER`, [view, options]);

      if (process.env.NODE_ENV != 'production') {
        const page = await res.KRender.appRender({
          options: options,
          page: view,
        });
        res.KRender.render({
          page: 'shell.ejs',
          options: {
            body: page,
          },
        });
      } else {
        _render.call(this, view, options, callback);
      }
    };

    const _send = res.send;
    res.send = async function (data) {
      if (!res.locals._rendered) {
        Logger.info(`SEND`, [data]);
      }
      _send.call(this, data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    const _write = res.write;
    res.write = async function (data: string) {
      if (res.locals._writedbody) {
        res.locals._writedbody += ' ' + data;
      } else {
        res.locals._writedbody = data;
      }
      _write.call(this, data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    const _end = res.end;
    res.end = async function (data) {
      let writebody = res.locals._writedbody ?? '';
      if (data) {
        writebody += ' ' + data;
      }
      if (!res.locals._rendered) {
        Logger.info(`SENDED WITH END`, [req.ip, writebody]);
      }

      _end.call(this, data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any;

    res['send404'] = async function (
      req: express.Request,
      res: express.Response
    ) {
      res.status(404);
      if (req.accepts('html')) {
        if (CustomErrors[404]) {
          res.render('errors/404', {
            ...res.locals,
          });
        } else {
          res.KRender.render({
            page: '404.ejs',
            layout: 'shell.ejs',
          });
        }
      } else {
        res.send();
      }
    };

    next();
  };
};

export const SetLocalsMiddleware = (data: UnasignedObject) => {
  return function (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): void {
    res.locals = { ...res.locals, ...data };
    next();
  };
};

export const SetLayoutMiddleware = (layout: string) => {
  return function (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): void {
    res.layout = layout;
    next();
  };
};
