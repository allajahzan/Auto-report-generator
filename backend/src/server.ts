// dotenv config
import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { isEnvDefined } from "./utils/envChecker";
import { MongodbConnection } from "@codeflare/common";
import http from "http";
import { connectSocketIO } from "./socket/connection";

// server
const startServer = async () => {
    try {
        // check all env are defined
        isEnvDefined();

        // connect to mongodb
        const db = new MongodbConnection(process.env.MONGO_DB_URL as string);
        // await db.retryConnection();

        // Server
        const server = http.createServer(app);

        // Connect socket-io
        connectSocketIO(server);

        //listen to port
        server.listen(process.env.PORT, () =>
            console.log("Bot server is running on port", process.env.PORT)
        );
    } catch (err: any) {
        console.log(err.message, "my message");
    }
};

startServer();
