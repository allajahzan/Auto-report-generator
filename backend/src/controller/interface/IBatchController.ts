import { NextFunction, Request, Response } from "express";

// Interface for Batch Controller
export interface IBatchController {
    getBatch(req: Request, res: Response, next: NextFunction): Promise<void>;
}