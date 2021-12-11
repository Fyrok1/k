import express from 'express';
import { CsrfProtection } from '../k/csrf';
import { RateLimiterMiddleware } from '../k/rateLimitter';
import { SiteRouter } from './routers/site.router';

export const DefaultRouter = express
  .Router()
  .use(CsrfProtection)
  .use('/', RateLimiterMiddleware, SiteRouter);
