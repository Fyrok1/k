"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-explicit-any */
const express_1 = __importDefault(require("express"));
const app = express_1.default();
require("./interfaces");
exports.default = app;
exports.randomText = (length) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};
exports.getUrls = function (...args) {
    const arr = [];
    for (let i = 0; i < args.length; i++) {
        if (args[i].stack instanceof Array) {
            args[i].stack.forEach(function (a) {
                const route = a.route;
                if (route) {
                    route.stack.forEach(function () {
                        arr.push(route.path);
                    });
                }
            });
        }
    }
    return arr;
};
exports.getIp = function (req) {
    const q = (req.headers["x-forwarded-for"] || req.connection.remoteAddress);
    let ip = q != null ? q.toString() : '';
    if (ip.substr(0, 7) == "::ffff:") {
        ip = ip.substr(7);
    }
    else if (ip == "::1") {
        ip = "127.0.0.1";
    }
    return ip;
};
