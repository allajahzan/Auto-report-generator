import express from "express";
import { errorHandler } from "@codeflare/common";
import router from "./routes";
import cors from "cors";
import { checkAuth } from "./middlewares";
import morgan from "morgan";

// create app
const app = express();

// middlewares
app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "https://auto-report-generator.vercel.app",
        ],
    })
);

app.use(morgan("dev"));
app.use(express.json());

// routes
app.use("/", checkAuth, router);

// error handler
app.use(errorHandler);

// export app
export default app;
