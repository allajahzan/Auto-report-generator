import { envChecker } from "@codeflare/common";
/**
 * Checks if all the required environment variables are defined.
 * @returns {void} nothing
 */
export const isEnvDefined = () => {
    envChecker(process.env.PORT as string, "PORT");
};
