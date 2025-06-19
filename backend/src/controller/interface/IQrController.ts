import { NextFunction, Request, Response } from "express";

/** Interface for QR Controller */
export interface IQRController {
    getQRcode(req: Request, res: Response, next: NextFunction) : Promise<void>;
}