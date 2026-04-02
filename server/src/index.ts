import { ENV } from './util/env';
import express from 'express';
import http from 'http';
import apiRouter from './http';
import 'dotenv/config';
import cors from 'cors';
import { logger } from './http/middleware/loggerMiddleware';
import { WebsocketServer } from './lib/websockets';
import { events } from './websocketEvents';

const app = express();
const server = http.createServer(app);
const io = new WebsocketServer(server).addEvents(events).start();

const corsOptions = {
  origin: ENV.ALLOW_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(logger);
app.use(cors(corsOptions));
app.use(express.json());
app.use('/api', apiRouter);

server.listen(ENV.PORT, () => {
  console.log(`Lattice backend now listening at ${ENV.HOST}:${ENV.PORT}`);
  console.log('Hello Andrew >:)');
});
