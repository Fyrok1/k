"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const rate_limiter_flexible_1 = require("rate-limiter-flexible");
const redis_1 = require("./redis");
const rateLimiter = new rate_limiter_flexible_1.RateLimiterRedis({
    storeClient: redis_1.redisClient,
    keyPrefix: 'rate-limitter',
    points: 10,
    duration: 1,
});
exports.RateLimiterMiddleware = (req, res, next) => {
    rateLimiter.consume(req.session.ip)
        .then(() => {
        next();
    })
        .catch(() => {
        res.status(400).send("Too many request");
    });
};
