import 'dotenv/config';
import express from "express";
import http from "http";
import {createIO} from "./socket/index.js";
import apiRouter from "./http/index.js";

const app = express();
const server = http.createServer(app);
const io = createIO(server);
const port = process.env.PORT;

app.use(express.json());
app.use('/api', apiRouter);

server.listen(port, () => {
  console.log("Lattice backend now listening");
  console.log("Hello Noah :)");
});
