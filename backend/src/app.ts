import express from "express";
import { errorHandler } from "@codeflare/common";
import router from "./routes/router";
import cors from "cors";
import { checkAuth } from "./middleware/check-auth";

// create app
const app = express();

// middlewares
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

// routes
app.use("/", checkAuth, router);

// error handler
app.use(errorHandler);

// export app
export default app;
