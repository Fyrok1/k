import express from 'express'
import { CsrfProtection } from '../k/csrf'
import { RateLimiterMiddleware } from '../k/rateLimitter'
import { RenderAngularApp } from '../k/render'
import { SiteRouter } from './routers/site.router'

export const DefaultRouter = express.Router()
  .use(CsrfProtection)
  .use('/app', RenderAngularApp('app'))
  .use('/', RateLimiterMiddleware, SiteRouter)

export const MultilangRouter = express.Router()