import express from 'express'
import { CsrfProtection } from '../k/csrf'
import { RateLimiterMiddleware } from '../k/rateLimitter'
import { RenderAngularApp } from '../k/render'
import { SiteRouter } from './routers/site.router'

export default express.Router()
  .use(CsrfProtection)
  .use('/',RateLimiterMiddleware,SiteRouter)
  .use('/app',RenderAngularApp('app'))