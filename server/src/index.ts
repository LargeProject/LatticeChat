import 'dotenv/config';
import express from "express";
import apiRouter from "./http/index.js";

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use('/api', apiRouter);

app.listen(port, () => {
  console.log("Lattice backend now listening");
  console.log("Hello Noah :)");
});
