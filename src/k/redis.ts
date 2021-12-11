import express from 'express';
import redis from 'redis';

export let redisStatus: {
  status: boolean;
  err?: Error | string;
} = {
  status: false,
  err: 'Redis Connecting...',
};

export let Redis: redis.RedisClient = null;

if (process.env.REDIS == '1') {
  Redis = redis.createClient(
    process.env.REDISPORT ? parseInt(process.env.REDISPORT) : 6379,
    process.env.REDISHOST,
    { password: process.env.REDISPASSWORD }
  );
  Redis.select(process.env.NODE_ENV == 'production' ? 0 : 1, (err: Error) => {
    if (err) {
      console.error(err);
    }
  });

  Redis.on('error', function (error) {
    redisStatus = {
      status: false,
      err: error,
    };
    console.error('Redis Down', error);
  });

  Redis.on('connect', function () {
    redisStatus = {
      status: true,
      err: '',
    };
    // console.log("Redis Up")
  });
} else {
  redisStatus.err = 'Redis disabled';
}

export const CheckRedisConnection = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void => {
  if (process.env.REDIS != '1' || redisStatus.status) {
    next();
  } else {
    res.KRender.error({
      error: redisStatus.err,
    });
  }
};
