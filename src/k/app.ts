/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express';
import http from 'http';
const app: express.Application = express();
import './interfaces';
export default app;

export const httpServer = http.createServer(app);
