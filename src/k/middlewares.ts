import app, { getIp, getUrls } from './app'
import bodyParser from "body-parser";
import helmet from 'helmet'
import express from 'express';
import session from 'express-session';
import hpp from 'hpp'
import path from 'path'
import expressLayouts from 'express-ejs-layouts'
import connectSessionSequelize from 'connect-session-sequelize'
// import connectRedis from 'connect-redis'
import { checkConnection, sequelize } from './sequelize'
import { v4 as uuidv4 } from 'uuid';
import expressSitemapXml from 'express-sitemap-xml';
// import { redisClient } from './redis'
import cookieParser from 'cookie-parser'
import fileUpload from 'express-fileupload'

import { SiteRouter } from '../routes/site.router';
import { gitPull } from './updateGit'
import { RateLimiterMiddleware } from './rateLimitter';

const SequelizeStore = connectSessionSequelize(session.Store);// Sequelize Session store
// let RedisStore = connectRedis(session)

import './cron'
import { Log } from './logger';
import { CsrfProtectionMiddleware } from './csrf';
import { RenderMiddleware } from './render';

app.enable('trust proxy')
//app.disable('view cache');
app.set('trust proxy', true)
app.set('layout', false)
app.set('etag', false)
app.set('view engine', 'ejs')
app.set('views', path.join(path.resolve(), '/src/views'));
app.use(expressLayouts)
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: './tmp/'
}));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));
app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.raw({ limit: '20mb' }));
app.use(helmet());
app.use(hpp());
// app.use(express.static('./dist'));
app.use(express.static('./public'));
app.use('/uploads', express.static('./uploads'));
app.use(cookieParser(process.env.SECRET));
app.use(RenderMiddleware())
app.use(checkConnection)
app.use(
  session({// express session config
    name: '_tkn',
    secret: process.env.SECRET ?? '',
    // store:( process.env.NODE_ENV == "production" ? new RedisStore({ client: redisClient }) : new SequelizeStore({ db: sequelize, tableName:"session" })),
    store: (new SequelizeStore({ db: sequelize, tableName:"session" })),
    cookie: {
      maxAge: ((1000 * 60 * 60 * 24) * 2)
    },
    resave: false,
    saveUninitialized: true,
    rolling: false,
    proxy: true, // if you do SSL outside of node.
    genid: function () {
      return uuidv4()
    },
  })
);

app.use((req:express.Request, res:express.Response, next:express.NextFunction) => {
  res.set('Cache-Control', 'no-store')
  res.header("Access-Control-Allow-Origin", "localhost");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.set("Content-Security-Policy", "script-src * 'unsafe-inline'");

  req.session.ip = getIp(req);
  req.session.path = req.originalUrl
  req.session.url = req.protocol + '://' + req.get('host') + req.originalUrl;
  req.session.host = req.protocol + '://' + req.get('host');
  next();
})

app.use(expressSitemapXml(() => getUrls(SiteRouter), `http://${process.env.HOST}/`))

// ++Router
if (process.env.NODE_ENV == "production") { 
  app.post('/gitPull', gitPull) 
}

app.use(CsrfProtectionMiddleware())
app.use('/',RateLimiterMiddleware, SiteRouter)

/* Multi language support detail in language.js
app.get('/',(req,res)=>{
  res.i18nRedirect('/')
})
supportedLanguges.forEach(lang=>{
  app.use('/'+lang+'/',changeLanguageMiddleware(lang),SiteRouter)
  app.use('/'+lang+'/admin',changeLanguageMiddleware(lang),AdminPanelRouter)
})
*/

app.use(function (req, res) {
  res.status(404)
  if (req.accepts('html')) {
    res.render("pages/k/404")
    return;
  }else{
    res.send();
  }
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, req, res, next:undefined) => {
  try{
    Log.create({ message: err, ip: req.session ? req.session.ip : "system" })
  }catch(e){
    console.error(err);
    console.error(e);
  }
  res.render('pages/k/error',{
    env:process.env,
    layout:null,
    error:err
  })
});