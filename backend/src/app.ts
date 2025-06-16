import express from "express";
import { errorHandler } from "@codeflare/common";
import router from "./routes/router";

// create app
const app = express();

// middlewares
app.use(express.json());

// routes
app.use("/", router);

// error handler
app.use(errorHandler);

// export app
export default app;
