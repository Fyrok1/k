/* eslint-disable @typescript-eslint/no-explicit-any */
// console.log(process.env.NODE_ENV, 'what');
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.join(path.resolve(), `${process.env.NODE_ENV}.env`),
});

import { Socket } from './socket';
import 'express-async-errors';
import { httpServer } from './app';
import chokidar from 'chokidar';

// MIDDLEWARES

import './middlewares';
import i18next from 'i18next';
import { supportedLanguges } from './language';
import { createRequiredFolders, deleteFolderRecursive } from './functions';
import { CheckCustomErrors } from './kRender';
import { Logger } from './logger';

createRequiredFolders(['./locales', './dist', './uploads/tmp']);

httpServer.listen(process.env.PORT, () => {
  console.log('Server on localhost:' + process.env.PORT);
});

if (process.env.NODE_ENV != 'production') {
  deleteFolderRecursive(path.join(path.resolve(), '/public/assets/css'));
  createRequiredFolders([path.join(path.resolve(), '/public/assets/css')]);
  let cooldown = 0;
  setInterval(() => {
    if (cooldown > 0) {
      cooldown--;
    }
  }, 1000);

  chokidar
    .watch(path.join(path.resolve(), '/public'))
    .on('all', (event, filepath) => {
      if (cooldown == 0) {
        cooldown = 2;
        if (filepath.endsWith('.css')) {
          console.log(`CSS UPDATE ${filepath.replace(path.resolve(), '')}`);
          Socket.emit('refresh-css');
        } else if (path.extname(filepath)) {
          console.log(`PUBLIC UPDATE ${filepath.replace(path.resolve(), '')}`);
          Socket.emit('refresh-page');
        }
      }
    });

  chokidar
    .watch(path.join(path.resolve(), '/src'))
    .on('all', async (event, path) => {
      if (path.endsWith('.ejs') && cooldown == 0) {
        await CheckCustomErrors();
        cooldown = 2;
        console.log(`EJS UPDATE ${path}`);
        Socket.emit('refresh-page');
      }
    });

  if (process.env.MULTI_LANG == '1') {
    chokidar
      .watch(path.join(path.resolve(), '/locales'))
      .on('change', async (filepath) => {
        i18next.reloadResources(supportedLanguges);
        if (cooldown == 0) {
          cooldown = 2;
          console.log(`LOCALES UPDATE ${filepath.replace(path.resolve(), '')}`);
          Socket.emit('refresh-page');
        }
      });
  }
}

process.on('unhandledRejection', (reason: any, promise) => {
  Logger.error('Unhandled Rejection at:', reason.stack || reason);
  console.log('Unhandled Rejection at:', reason.stack || reason);
  console.log(reason);
  console.log(promise);
});

process.on('uncaughtException', function (error) {
  Logger.error(error);
  console.log(error);
});
