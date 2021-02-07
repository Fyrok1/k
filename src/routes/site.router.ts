import { SiteController } from '../controllers/site.controller';
import express from 'express'
import { SetLayoutMiddleware } from '../k/render';
const router = express.Router();

export const SiteRouter = router
  .use(SetLayoutMiddleware('./layouts/site'))
  .use(SiteController.getLayout())
  .get('/',SiteController.getIndex)