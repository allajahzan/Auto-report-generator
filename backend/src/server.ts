// dotenv config
import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { isEnvDefined } from "./utils/envChecker";
import { startSocket } from "./bot/baileys";
import { MongodbConnection } from "@codeflare/common";

// server
const startServer = async () => {
    try {
        // check all env are defined
        isEnvDefined();

        // Start baileys bot
        startSocket();

        // connect to mongodb
        const db = new MongodbConnection(process.env.MONGO_DB_URL as string);
        await db.retryConnection();

        //listen to port
        app.listen(process.env.PORT, () =>
            console.log("Bot server is running on port", process.env.PORT)
        );
    } catch (err: any) {
        console.log(err.message);
    }
};

startServer();
