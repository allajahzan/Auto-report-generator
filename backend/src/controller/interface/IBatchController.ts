import { NextFunction, Request, Response } from "express";

// Interface for Batch Controller
export interface IBatchController {
    getBatch(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateBatchDetails(req: Request, res: Response, next: NextFunction): Promise<void>;
    getParticipants(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateParicipants(req: Request, res: Response, next: NextFunction) : Promise<void>;
    selectGroup(req: Request, res: Response, next: NextFunction) : Promise<void>;
    disconnect(req: Request, res: Response, next: NextFunction) : Promise<void>;
}