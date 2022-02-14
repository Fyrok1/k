import express from 'express';
import mkdirp from 'mkdirp';
import fs from 'fs';
import sass from 'sass';

export const randomText = (length: number): string => {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const getUrls = function (...args: Array<any>): Array<string> {
  const arr: any = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i].stack instanceof Array) {
      args[i].stack.forEach(function (a: any) {
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

export const getIp = function (req: express.Request): string {
  const q = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  let ip = q != null ? q.toString() : '';
  if (ip.substr(0, 7) == '::ffff:') {
    ip = ip.substr(7);
  } else if (ip == '::1') {
    ip = '127.0.0.1';
  }
  return ip;
};

export const createRequiredFolders = async function (
  folderList: string[]
): Promise<void> {
  folderList.forEach(async (folderPath) => {
    await mkdirp.sync(folderPath);
  });
};

export const deleteFolderRecursive = function (path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function (file) {
      const curPath = path + '/' + file;
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        deleteFolderRecursive(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

const scssCache = {};

export const scssMiddleware = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (req.path.startsWith('/assets/css') && req.path.endsWith('.css')) {
    let filepath = req.path.replace('/assets/css', './scss');
    filepath = filepath.substr(0, filepath.length - 4);
    filepath += '.scss';

    if (process.env.NODE_ENV == 'development' && scssCache[filepath]) {
      res.set('Content-Type', 'text/css');
      res.send(scssCache[filepath]);
    } else if (fs.existsSync(filepath)) {
      const scss = fs.readFileSync(filepath).toString();
      const css = sass.renderSync({
        data: scss,
        outputStyle: 'compressed',
      });
      res.set('Content-Type', 'text/css');
      res.send(css.css.toString());

      if (process.env.NODE_ENV == 'production') {
        let cssPath = filepath.replace('./scss', './public/assets/css');
        cssPath = cssPath.substr(0, cssPath.length - 5);
        cssPath += '.css';
        fs.writeFileSync(cssPath, css.css.toString());
      } else {
        scssCache[filepath] = css.css.toString();
      }
    } else {
      next();
    }
  } else {
    next();
  }
};
