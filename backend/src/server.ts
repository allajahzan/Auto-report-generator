// dotenv config
import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { MongodbConnection } from "@codeflare/common";
import http from "http";
import { validateEnv } from "./utils";
import { startBaileysSockets } from "./bot";
import { connectSocketIO } from "./socket";

// server
const startServer = async () => {
    try {
        // validate envs
        validateEnv();

        // connect to mongodb
        const db = new MongodbConnection(process.env.MONGO_DB_URL as string);
        await db.retryConnection();

        // Start baileys sockets
        startBaileysSockets();

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
