import { SiteController } from '../../controllers/site.controller';
import express from 'express'
import { SetLayoutMiddleware } from '../../k/render';
import { AuthGuard, RedirectOnAuth } from '../../k/authGuard';
const router = express.Router();

export const SiteRouter = router
  .use(SetLayoutMiddleware('./layouts/site'))
  .get('/',SiteController.getIndex)
  .get('/nonsecret',RedirectOnAuth('/secret'), SiteController.getNonSecret)
  .get('/secret',AuthGuard('/nonsecret'), SiteController.getSecret)
  .get('/login', SiteController.getLogin)
  .get('/logout', SiteController.getLogout)