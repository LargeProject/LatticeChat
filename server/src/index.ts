import { ENV } from "./util/env";
import express from "express";
import http from "http";
import { createIO } from "./socket";
import apiRouter from "./http";
import "dotenv/config";
import cors from 'cors';

const app = express();
const server = http.createServer(app);
const io = createIO(server);

const allowedOrigins = [
  'http://165.245.167.192:3000',
  'http://localhost:3000',
];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions))
app.use(express.json());
app.use("/api", apiRouter);

server.listen(ENV.PORT, () => {
  console.log("Lattice backend now listening");
  console.log("Hello Noah >:)");
});