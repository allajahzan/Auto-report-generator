import { Request, Response, NextFunction } from "express";

// Interface for Report Controller
export interface IRreportController {
    getReport(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateReportInformation(req: Request, res: Response, next: NextFunction): Promise<void>;
    updateReportAttendence(req: Request, res: Response, next: NextFunction): Promise<void>;
}
