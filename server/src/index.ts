import { ENV } from "./util/env";
import express from "express";
import http from "http";
import { createIO } from "./socket";
import apiRouter from "./http";
import "dotenv/config";
import cors from "cors";
import { logger } from "./http/middleware/loggerMiddleware";

const app = express();
const server = http.createServer(app);
const io = createIO(server);

const corsOptions = {
  origin: ENV.ALLOWED_ORIGIN,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(logger);
app.use(cors(corsOptions));
app.use(express.json());
app.use("/api", apiRouter);

server.listen(ENV.PORT, () => {
  console.log("Lattice backend now listening");
  console.log("Hello Andrew >:)");
});

