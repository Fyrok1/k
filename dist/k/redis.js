"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = __importDefault(require("redis"));
exports.redisClient = redis_1.default.createClient(process.env.REDISPORT ? parseInt(process.env.REDISPORT) : 6379, process.env.REDISHOST, { password: process.env.REDISPASSWORD });
exports.redisClient.select(process.env.NODE_ENV == "production" ? 0 : 1, (err) => {
    if (err) {
        console.log(err);
    }
    else {
        //redisClient.set('test',(new Date().getTime().toString()))
    }
});
exports.redisClient.on("error", function (error) {
    console.error("Redis Down", error);
});
exports.redisClient.on("connect", function () {
    // console.log("Redis Up");
});
exports.checkRedisConnection = (req, res, next) => {
    exports.redisClient.get('test', (err) => {
        if (err) {
            res.status(400).send(err);
        }
        else {
            next();
        }
    });
    return;
};
