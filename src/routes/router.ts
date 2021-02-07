import express from 'express'
import { csrfProtection } from '../k/csrf'
import { RateLimiterMiddleware } from '../k/rateLimitter'
import { RenderAngularApp } from '../k/render'
import { SiteRouter } from './site.router'

export default express.Router()
  .use(csrfProtection)
  .use('/',RateLimiterMiddleware,SiteRouter)
  .use('/app',RenderAngularApp('app'))