/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express';
import http from 'http';
const app: express.Application = express();
import './interfaces'
export default app

export const httpServer = http.createServer(app);

export const randomText = (length: number) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export const getUrls = function (...args: any[]) {
  const arr: any = []
  for (let i = 0; i < args.length; i++) {
    if (args[i].stack instanceof Array) {
      args[i].stack.forEach(function (a: any) {
        const route = a.route;
        if (route) {
          route.stack.forEach(function () {
            arr.push(route.path);
          })
        }
      });
    }
  }
  return arr;
}

export const getIp = function (req: express.Request) {
  const q = (req.headers["x-forwarded-for"] || req.connection.remoteAddress);
  let ip = q != null ? q.toString() : '';
  if (ip.substr(0, 7) == "::ffff:") {
    ip = ip.substr(7);
  }
  else if (ip == "::1") {
    ip = "127.0.0.1";
  }
  return ip;
}