import csrf from 'csurf';
import app from './app';
import express from 'express';
export const CsrfProtection = csrf({ cookie: true });

export const CsrfProtectionMiddleware = (): express.Handler => {
  app.use(csrf());
  return function (req, res, next): express.Handler {
    res.cookie('_csrf', req.csrfToken());
    next();
    return;
  };
};
