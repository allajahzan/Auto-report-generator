import { envChecker } from "@codeflare/common";

// Validate env
export const validateEnv = () => {
    envChecker(process.env.PORT as string, "PORT");
    envChecker(process.env.MONGO_DB_URL as string, "MONGO_DB_URL");
    envChecker(process.env.CLIENT_URL as string, "CLIENT_URL");
};
