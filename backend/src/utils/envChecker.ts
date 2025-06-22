import { envChecker } from "@codeflare/common";

// Check env 
export const isEnvDefined = () => {
    envChecker(process.env.PORT as string, "PORT");
};
