"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const site_controller_1 = require("../controllers/site.controller");
const express_1 = __importDefault(require("express"));
const render_1 = require("../k/render");
const router = express_1.default.Router();
exports.SiteRouter = router
    .use(render_1.SetLayoutMiddleware('./layouts/site'))
    .use(site_controller_1.SiteController.getLayout())
    .get('/', site_controller_1.SiteController.getIndex)
    .use('/app', render_1.RenderAngularApp('app'));
