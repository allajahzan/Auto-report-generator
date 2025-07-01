import express from "express";
import { errorHandler } from "@codeflare/common";
import router from "./routes";
import cors from "cors";
import { checkAuth } from "./middleware";

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
