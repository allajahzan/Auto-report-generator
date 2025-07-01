import {
    ForbiddenError,
    UnauthorizedError,
} from "@codeflare/common";
import { Request, Response, NextFunction } from "express";
import fs from "fs";
import { getSocket } from "../bot";

export const checkAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { coordinatorId } = req.query;

        const phoneNumber = coordinatorId as string;

        // Check if auth_info directory exists or empty
        const auth_info_dir = `src/auth_info/${phoneNumber}`;

        if (
            !fs.existsSync(auth_info_dir) ||
            fs.readdirSync(auth_info_dir).length === 0
        ) {
            throw new UnauthorizedError("Session expired!");
        }

        const sock = getSocket(phoneNumber);
        if (!sock) {
            throw new ForbiddenError();
        }

        next();
    } catch (err: unknown) {
        next(err);
    }
};
