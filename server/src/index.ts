import express from "express";
import http from "http";
import { createIO } from "./socket/index.js";
import { connectMongoDB } from "./db/index.js";
import apiRouter from "./http/index.js";

import "dotenv/config";

const app = express();
const server = http.createServer(app);
const io = createIO(server);
const port = process.env.API_PORT;

app.use(express.json());
app.use("/api", apiRouter);

connectMongoDB();

server.listen(port, () => {
  console.log("Lattice backend now listening");
  console.log("Hello Noah >:)");
});
