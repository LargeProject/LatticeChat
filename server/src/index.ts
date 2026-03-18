import express from "express";
import http from "http";
import { createIO } from "./socket";
import apiRouter from "./http";
import { ENV } from "./util/env";
import { connectMongoDB } from "./db";
import "dotenv/config";

const app = express();
const server = http.createServer(app);
const io = createIO(server);

app.use(express.json());
app.use("/api", apiRouter);

connectMongoDB();

server.listen(ENV.PORT, () => {
  console.log("Lattice backend now listening");
  console.log("Hello Andrew :)");
});
