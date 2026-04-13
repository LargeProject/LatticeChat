import express from 'express';
import http from 'node:http';
import { WebsocketServer } from './lib/websocket';
import { events } from './websocket/clientEvents';
import { ENV } from './util/env';
import cors from 'cors';
import { logger } from './http/middleware/loggerMiddleware';
import apiRouter from './http';

const corsOptions = {
  origin: ENV.ALLOW_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

const app = express();
app.use(cors(corsOptions));
app.use(express.json());
app.use(logger);
app.use('/api', apiRouter);

export const server = http.createServer(app);
export const io = new WebsocketServer(server).registerEvents(events);
