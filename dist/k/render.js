"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const path_1 = __importDefault(require("path"));
const dayjs_1 = __importDefault(require("dayjs"));
const ejs_1 = __importDefault(require("ejs"));
const fs_1 = __importDefault(require("fs"));
const express_1 = __importDefault(require("express"));
exports.RenderGetMethods = (router) => {
    const _get = router.get;
    router.get = function (path, ...handlers) {
        return _get.call(this, path, ...handlers);
    };
    return router;
};
exports.RenderMiddleware = () => {
    return (req, res, next) => {
        var _a;
        res.locals = Object.assign(Object.assign({}, ((_a = res.locals) !== null && _a !== void 0 ? _a : {})), {
            env: {
                NODE_ENV: process.env.NODE_ENV
            },
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
            dayjs: dayjs_1.default,
            partial: (filename, data = {}, options = {}) => {
                const d = {};
                Object.assign(d, res.locals, data);
                return ejs_1.default.render(fs_1.default.readFileSync(path_1.default.join(path_1.default.resolve(), '/src/views/partials/', filename + '.ejs'), 'utf-8'), d, options);
            },
            iteration: (i, page = 1, pageSize = 25) => {
                return (i + 1) + ((page - 1) * pageSize);
            },
            link: (url) => {
                return url;
            },
            _csrf: () => {
                return `<input type="hidden" name="_csrf" value="${req.csrfToken()}">`;
            },
            _urlParams: (data = { add: {}, blacklist: [], whitelist: [], pre: "" }) => {
                var _a, _b;
                let text = "";
                let add = data.add ? data.add : {};
                const blacklist = (_a = data.blacklist) !== null && _a !== void 0 ? _a : [];
                const whitelist = (_b = data.whitelist) !== null && _b !== void 0 ? _b : [];
                const pre = data.pre ? data.pre : "";
                const qadd = {};
                Object.assign(qadd, req.query, add);
                add = qadd;
                blacklist.forEach(removeKey => {
                    delete add[removeKey];
                });
                if (whitelist.length > 0) {
                    Object.keys(add).forEach(key => {
                        if (!whitelist.includes(key)) {
                            delete add[key];
                        }
                    });
                }
                Object.keys(add).forEach(key => {
                    if (add[key] == "") {
                        delete add[key];
                    }
                });
                Object.keys(add).forEach(key => {
                    if (text != "") {
                        text += "&";
                    }
                    text += key + '=' + add[key];
                });
                if (text.length > 0) {
                    text = "?" + text;
                }
                return pre + text;
            },
            randomText: app_1.randomText
        });
        const _render = res.render;
        res.render = function (view, options, callback) {
            if (!options["layout"] && res.layout) {
                options["layout"] = res.layout;
            }
            _render.call(this, view, options, callback);
        };
        next();
    };
};
exports.SetLocalsMiddleware = (data) => {
    return function (req, res, next) {
        res.locals = Object.assign(Object.assign({}, res.locals), data);
        next();
    };
};
exports.SetLayoutMiddleware = (layout) => {
    return function (req, res, next) {
        res.layout = layout;
        next();
    };
};
exports.RenderAngularAppFile = (appName) => {
    return (req, res) => {
        res.layout = null;
        if (req.originalUrl.indexOf('.') == -1 && req.originalUrl[req.originalUrl.length - 1] != "/") {
            res.redirect(req.originalUrl + '/');
        }
        else if (req.url == `/`) {
            const filePath = path_1.default.join(path_1.default.resolve(), 'dist/' + appName + '/index.html');
            if (fs_1.default.existsSync(filePath)) {
                if (process.env.NODE_ENV == "production") {
                    res.sendFile(filePath);
                }
                else {
                    const body = fs_1.default.readFileSync(filePath, "utf-8");
                    res.render('layouts/k/app-shell', {
                        body
                    });
                }
            }
            else {
                res.status(404).send();
            }
        }
        else {
            const filePath = path_1.default.join(path_1.default.resolve(), 'dist/' + appName + '/' + req.url);
            if (fs_1.default.existsSync(filePath)) {
                res.sendFile(path_1.default.join(path_1.default.resolve(), 'dist/' + appName + '/' + req.url));
            }
            else {
                res.status(404).send();
            }
        }
        return;
    };
};
exports.RenderAngularApp = (appName) => {
    return express_1.default.Router()
        .get('*', exports.RenderAngularAppFile(appName));
};
