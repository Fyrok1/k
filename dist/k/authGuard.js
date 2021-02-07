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
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("./logger");
function AuthGuard(auth, redirect) {
    return function (req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            if (req.session.auth && req.session.auth[auth]) {
                next();
            }
            else {
                if (typeof redirect == "string") {
                    res.redirect(redirect);
                }
                else if (typeof redirect == "object") {
                    if (Object.keys(redirect).length == 0) {
                        redirect.msg = "Unauthorized";
                    }
                    res.status(401).json(redirect);
                }
                else {
                    if (req.method == "GET") {
                        res.status(401).redirect('/');
                    }
                    else {
                        res.status(401).send();
                    }
                }
            }
            return;
        });
    };
}
exports.AuthGuard = AuthGuard;
function RedirectOnAuth(auth, redirect) {
    return function (req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            if (req.session.auth && req.session.auth[auth]) {
                res.redirect(redirect);
            }
            else {
                next();
            }
            return;
        });
    };
}
exports.RedirectOnAuth = RedirectOnAuth;
function Logout(req, auth) {
    return new Promise((resolve, reject) => {
        try {
            delete req.session.auth[auth];
            if (Object.keys(req.session.auth).length === 0 && req.session.auth.constructor === Object) {
                delete req.session.auth;
            }
        }
        catch (error) {
            logger_1.Log.create({ message: error });
            reject(error);
        }
        finally {
            req.session.save((err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        }
    });
}
exports.Logout = Logout;
function checkAuthority(authorityId, authName = null) {
    return function (req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let authorities;
                if (authName) {
                    authorities = req.session.auth[authName].authorities;
                }
                else {
                    authorities = req.session.authorities;
                }
                if (authorities.includes(authorityId)) {
                    next();
                }
                else {
                    res.status(400).send({ alert: "Bu işlem için yetkiniz yok" });
                }
            }
            catch (e) {
                res.status(400).send({ alert: "Bu işlem için yetkiniz yok" });
            }
            return;
        });
    };
}
exports.checkAuthority = checkAuthority;
