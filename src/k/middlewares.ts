import app from './app';
import { getIp } from './functions';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import express from 'express';
import session from 'express-session';
import MemoryStore from 'memorystore';
import hpp from 'hpp';
import path from 'path';
import expressLayouts from 'express-ejs-layouts';
import cors from 'cors';
import connectSessionSequelize from 'connect-session-sequelize';
import { CheckSequelizeConnection, sequelize } from './sequelize';
import { v4 as uuidv4 } from 'uuid';
import connectRedis from 'connect-redis';
import { CheckRedisConnection, Redis } from './redis';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import './mailer';

import { gitPull } from './updateGit';

import './cron';
import { Logger } from './logger';
import { RenderMiddleware } from './render';
import { DefaultRouter, MultilangRouter } from '../web/router';
import {
  ChangeLanguageMiddleware,
  RedirectToMultilang,
  supportedLanguges,
} from './language';
import { HttpConfig } from '../web/http';
import { KRenderMiddleware } from './kRender';

if (process.env.NODE_ENV != 'production') app.disable('view cache');
app.enable('trust proxy');
app.set('trust proxy', true);
app.set('layout', false);
app.set('etag', false);
app.set('view engine', 'ejs');
app.set('views', path.join(path.resolve(), '/src/views'));
app.use(expressLayouts);
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: './uploads/tmp/',
    limits: {
      fileSize: HttpConfig.uploadFileSizeLimit * 1000000, //20mb
    },
    abortOnLimit: true,
  })
);
app.use(
  bodyParser.urlencoded({
    limit: HttpConfig.requestSizeLimit + 'mb',
    extended: true,
  })
);
app.use(bodyParser.json({ limit: HttpConfig.requestSizeLimit + 'mb' }));
app.use(bodyParser.raw({ limit: HttpConfig.requestSizeLimit + 'mb' }));
app.use(helmet());
app.use(hpp());
app.use(express.static('./public'));
app.use('/uploads', express.static('./uploads'));
app.use(cookieParser(process.env.SECRET));
app.use(cors());
app.use(RenderMiddleware());
app.use(KRenderMiddleware());
app.use(CheckSequelizeConnection);
app.use(CheckRedisConnection);
app.use(
  session({
    name: '_tkn',
    secret: process.env.SECRET ?? '',
    store:
      process.env.REDIS == '1'
        ? new (connectRedis(session))({ client: Redis })
        : process.env.DB == '1'
        ? new (connectSessionSequelize(session.Store))({
            db: sequelize,
            tableName: 'session',
          })
        : new (MemoryStore(session))({
            checkPeriod: 1000 * 60 * 60 * 2,
          }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 2,
    },
    resave: false,
    saveUninitialized: true,
    rolling: false,
    proxy: true, // if you do SSL outside of node.
    genid: function () {
      return uuidv4();
    },
  })
);

app.use(
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.set(HttpConfig.headers);

    req.session.ip = getIp(req);
    req.session.path = req.originalUrl;
    req.session.url = req.protocol + '://' + req.get('host') + req.originalUrl;
    req.session.host = req.protocol + '://' + req.get('host');
    next();
  }
);

// app.use(expressSitemapXml(() => getUrls(SiteRouter), `http://${process.env.HOST}/`))

// ++Router
if (process.env.NODE_ENV == 'production' && process.env.GITPULL == '1') {
  app.post('/gitPull', gitPull);
}

app.use(DefaultRouter);
if (process.env.MULTI_LANG == '1') {
  supportedLanguges.forEach((lang) => {
    app.use('/' + lang + '/', ChangeLanguageMiddleware(lang), MultilangRouter);
  });
  app.use(RedirectToMultilang());
} else {
  app.use(MultilangRouter);
}

app.use(async function (req, res: express.Response) {
  res.send404(req, res);
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, req, res, next) => {
  res.status(500);
  Logger.error(err, { ip: req.session.ip ?? 'SYSTEM' });
  try {
    if (req.accepts('html')) {
      res.KRender.error({ error: err });
    } else if (req.accepts('json')) {
      res.json({
        error: err.toString(),
        msg: 'something went wrong',
      });
    } else if (req.accepts('text/plain')) {
      res.send(err.toString());
    } else {
      res.send();
    }
  } catch (error) {
    res.send(error);
  }
});
