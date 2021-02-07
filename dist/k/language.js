"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const i18next_1 = __importDefault(require("i18next"));
const i18next_express_middleware_1 = __importDefault(require("i18next-express-middleware"));
const i18next_node_fs_backend_1 = __importDefault(require("i18next-node-fs-backend"));
const path_1 = __importDefault(require("path"));
const app_1 = __importDefault(require("./app"));
exports.defaultLanguage = 'en';
exports.supportedLanguges = ['tr', 'en', 'de'];
i18next_1.default
    .use(i18next_node_fs_backend_1.default)
    .use(i18next_express_middleware_1.default.LanguageDetector)
    .init({
    backend: {
        loadPath: path_1.default.join(path_1.default.resolve(), '/locales/{{lng}}.json'),
    },
    detection: {
        order: ['querystring', 'cookie'],
        caches: ['cookie']
    },
    fallbackLng: exports.defaultLanguage,
    preload: exports.supportedLanguges
});
app_1.default.use(i18next_express_middleware_1.default.handle(i18next_1.default));
exports.changeLanguageMiddleware = (lang) => {
    return function (req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            req.i18n.changeLanguage(lang, ((err) => {
                req.session.language = lang;
                res.locals._language = lang;
                res.locals._languages = exports.supportedLanguges;
                if (err)
                    console.log(err);
                next();
            }));
        });
    };
};
/*
for reload resources
i18next.reloadResources(supportedLanguges)
*/ 
