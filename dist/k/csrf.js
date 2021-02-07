"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const csurf_1 = __importDefault(require("csurf"));
const app_1 = __importDefault(require("./app"));
exports.csrfProtection = csurf_1.default();
exports.CsrfProtectionMiddleware = () => {
    app_1.default.use(exports.csrfProtection);
    return function (req, res, next) {
        res.cookie('_csrf', req.csrfToken());
        next();
        return;
    };
};
