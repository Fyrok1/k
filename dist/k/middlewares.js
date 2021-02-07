"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importStar(require("./app"));
const body_parser_1 = __importDefault(require("body-parser"));
const helmet_1 = __importDefault(require("helmet"));
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const hpp_1 = __importDefault(require("hpp"));
const path_1 = __importDefault(require("path"));
const express_ejs_layouts_1 = __importDefault(require("express-ejs-layouts"));
const connect_session_sequelize_1 = __importDefault(require("connect-session-sequelize"));
// import connectRedis from 'connect-redis'
const sequelize_1 = require("./sequelize");
const uuid_1 = require("uuid");
const express_sitemap_xml_1 = __importDefault(require("express-sitemap-xml"));
// import { checkRedisConnection, redisClient } from './redis'
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const site_router_1 = require("../routes/site.router");
const updateGit_1 = require("./updateGit");
const rateLimitter_1 = require("./rateLimitter");
const SequelizeStore = connect_session_sequelize_1.default(express_session_1.default.Store); // Sequelize Session store
// let RedisStore = connectRedis(session)
require("./cron");
const logger_1 = require("./logger");
const csrf_1 = require("./csrf");
const render_1 = require("./render");
app_1.default.enable('trust proxy');
//app.disable('view cache');
app_1.default.set('trust proxy', true);
app_1.default.set('layout', false);
app_1.default.set('etag', false);
app_1.default.set('view engine', 'ejs');
app_1.default.set('views', path_1.default.join(path_1.default.resolve(), '/src/views'));
app_1.default.use(express_ejs_layouts_1.default);
app_1.default.use(express_fileupload_1.default({
    useTempFiles: true,
    tempFileDir: './tmp/'
}));
app_1.default.use(body_parser_1.default.urlencoded({ limit: '20mb', extended: true }));
app_1.default.use(body_parser_1.default.json({ limit: '20mb' }));
app_1.default.use(body_parser_1.default.raw({ limit: '20mb' }));
app_1.default.use(helmet_1.default());
app_1.default.use(hpp_1.default());
// app.use(express.static('./dist'));
app_1.default.use(express_1.default.static('./public'));
app_1.default.use('/uploads', express_1.default.static('./uploads'));
app_1.default.use(cookie_parser_1.default(process.env.SECRET));
app_1.default.use(render_1.RenderMiddleware());
app_1.default.use(sequelize_1.checkConnection);
app_1.default.use(express_session_1.default({
    name: '_tkn',
    secret: (_a = process.env.SECRET) !== null && _a !== void 0 ? _a : '',
    // store:( process.env.NODE_ENV == "production" ? new RedisStore({ client: redisClient }) : new SequelizeStore({ db: sequelize, tableName:"session" })),
    store: (new SequelizeStore({ db: sequelize_1.sequelize, tableName: "session" })),
    cookie: {
        maxAge: ((1000 * 60 * 60 * 24) * 2)
    },
    resave: false,
    saveUninitialized: true,
    rolling: false,
    proxy: true,
    genid: function () {
        return uuid_1.v4();
    },
}));
app_1.default.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    res.header("Access-Control-Allow-Origin", "localhost");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.set("Content-Security-Policy", "script-src * 'unsafe-inline'");
    req.session.ip = app_1.getIp(req);
    req.session.path = req.originalUrl;
    req.session.url = req.protocol + '://' + req.get('host') + req.originalUrl;
    req.session.host = req.protocol + '://' + req.get('host');
    next();
});
app_1.default.use(express_sitemap_xml_1.default(() => app_1.getUrls(site_router_1.SiteRouter), `http://${process.env.HOST}/`));
// ++Router
if (process.env.NODE_ENV == "production") {
    app_1.default.post('/gitPull', updateGit_1.gitPull);
}
app_1.default.use(csrf_1.CsrfProtectionMiddleware());
app_1.default.use('/', rateLimitter_1.RateLimiterMiddleware, site_router_1.SiteRouter);
/* Multi language support detail in language.js
app.get('/',(req,res)=>{
  res.i18nRedirect('/')
})
supportedLanguges.forEach(lang=>{
  app.use('/'+lang+'/',changeLanguageMiddleware(lang),SiteRouter)
  app.use('/'+lang+'/admin',changeLanguageMiddleware(lang),AdminPanelRouter)
})
*/
app_1.default.use(function (req, res) {
    res.status(404);
    if (req.accepts('html')) {
        res.render("pages/k/404");
        return;
    }
    else {
        res.send();
    }
});
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app_1.default.use((err, req, res, next) => {
    try {
        logger_1.Log.create({ message: err, ip: req.session ? req.session.ip : "system" });
    }
    catch (e) {
        console.error(err);
        console.error(e);
    }
    res.render('pages/k/error', {
        env: process.env,
        layout: null,
        error: err
    });
});
