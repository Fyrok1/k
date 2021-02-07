import csrf from 'csurf'
import app from './app'
import express from "express";
export const csrfProtection = csrf()

export const CsrfProtectionMiddleware = ():express.Handler=>{
  app.use(csrfProtection);
  return function(req,res,next):express.Handler {
    res.cookie('_csrf', req.csrfToken())
    next();
    return;
  }
}