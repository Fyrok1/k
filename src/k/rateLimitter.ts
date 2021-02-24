import { RateLimiterRedis } from "rate-limiter-flexible";
import express from "express";
import { Redis } from "./redis";

const duration = Number(process.env.RATE_LIMITTER_DURATION)??1, points = Number(process.env.RATE_LIMITTER_POINT)??10;
let rateLimiter;
if (process.env.REDIS == "1") {
  rateLimiter = new RateLimiterRedis({
    storeClient: Redis,
    keyPrefix: 'rate-limitter',
    points: points, // 10 requests
    duration: duration, // per 1 second by IP
  });
} else {
  rateLimiter = sessionRateLimitter;
}


export const RateLimiterMiddleware = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.url.includes('.')) {
    next();
  } else {
    if (process.env.REDIS == "1") {
      rateLimiter.consume(req.session.ip)
        .then(() => {
          next();
        })
        .catch(() => {
          res.status(429).send("Too many request")
        });
    } else {
      rateLimiter(req, res, next)
    }
  }

};

export const ClearRateLimitterMiddleware = () => {
  return async function (req, res, next) {
    ClearRateLimitter(req).then(next)
  }
}

export const ClearRateLimitter = async (req: express.Request) => {
  if (process.env.REDIS == "1") {
    Redis.set(req.session.ip, "1")
  } else {
    req.session.ratelimitter = {
      count: 1,
      time: Math.floor((new Date().getTime()) / 1000)
    }
  }
}

function sessionRateLimitter(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (req.session.ratelimitter) {
    const time = Math.floor((new Date().getTime()) / 1000);
    if (time - req.session.ratelimitter.time > duration) {
      req.session.ratelimitter = {
        count: 1,
        time: Math.floor((new Date().getTime()) / 1000)
      }
      req.session.save(() => {
        next();
      })
    } else if (req.session.ratelimitter.count > points) {
      res.status(429).send("Too many request")
    } else {
      req.session.ratelimitter.count += 1;
      req.session.save(() => {
        next();
      })
    }
  } else {
    req.session.ratelimitter = {
      count: 1,
      time: Math.floor((new Date().getTime()) / 1000)
    }
    req.session.save(() => {
      next();
    })
  }
}