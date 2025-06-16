// dotenv config
import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { isEnvDefined } from "./utils/envChecker";

// server
const startServer = async () => {
    try {
        // check all env are defined
        isEnvDefined();

        // // connect to mongodb
        // const db = new MongodbConnection(process.env.MONGO_DB_URL as string);
        // await db.retryConnection();

        //listen to port
        app.listen(process.env.PORT, () =>
            console.log("Bot server is running on port 3000")
        );
    } catch (err: any) {
        console.log(err.message);
    }
};

startServer();
