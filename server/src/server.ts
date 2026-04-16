import cors from 'cors';
import express from 'express';
import http from 'node:http';
import path from 'node:path';
import swaggerUi from 'swagger-ui-express';
import apiRouter from './http';
import { LogLevels } from './util/log';
import { logger } from './http/middleware/loggerMiddleware';
import { WebsocketServer } from './lib/websocket';
import { ENV } from './util/env';
import { events } from './websocket/clientEvents';

const corsOptions = {
  origin: ENV.ALLOW_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
if (ENV.LOG_LEVEL == 'info') app.use(logger);

// Serve OpenAPI spec and Swagger UI
app.get('/openapi.yaml', (req, res) => {
  const spec = path.resolve(process.cwd(), 'docs', 'openapi.yaml');
  if (!spec) {
    res.status(404).send('OpenAPI spec not found');
    return;
  }
  res.sendFile(spec);
});

app.use(
  '/docs',
  swaggerUi.serve,
  swaggerUi.setup(undefined, { explorer: true, swaggerOptions: { url: '/openapi.yaml' } }),
);

app.use('/api', apiRouter);
if (ENV.LOG_LEVEL == LogLevels.INFO) app.use(logger);

export const server = http.createServer(app);
export const io = new WebsocketServer(server).registerEvents(events);

function shutdown(signal: string) {
  console.log(`\nReceived ${signal}. Closing server...`);

  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });

  // force exit if something is hanging
  setTimeout(() => {
    console.error('Forcing shutdown');
    process.exit(1);
  }, 5000);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
