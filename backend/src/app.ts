import express from "express";
import { errorHandler } from "@codeflare/common";
import router from "./routes/router";
import cors from "cors";

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
app.use("/", router);

// error handler
app.use(errorHandler);

// Unhandled rejection
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
});

// export app
export default app;
