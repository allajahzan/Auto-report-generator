import { Request, Response, NextFunction } from "express";
import { IReportService } from "../../service/interface/IReportService";
import { IRreportController } from "../interface/IReportController";
import {
    HTTPStatusCode,
    ResponseMessage,
    SendResponse,
} from "@codeflare/common";

// Implementation for Report Controller
export class ReportController implements IRreportController {
    private reportService: IReportService;

    constructor(reportService: IReportService) {
        this.reportService = reportService;
    }

    // Get report
    async getReport(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { batchId } = req.query;
            const data = await this.reportService.getReport(batchId as string);

            SendResponse(res, HTTPStatusCode.OK, ResponseMessage.SUCCESS, data);
        } catch (err: unknown) {
            next(err);
        }
    }

    // Update report information
    async updateReportInformation(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { batchId } = req.query;
            const data = req.body;

            await this.reportService.updateReportInformation(batchId as string, data);

            SendResponse(res, HTTPStatusCode.OK, ResponseMessage.SUCCESS);
        } catch (err: unknown) {
            next(err);
        }
    }

    // Update report attendence
    async updateReportAttendence(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { batchId } = req.query;
            const data = req.body;

            await this.reportService.updateReportAttendence(batchId as string, data);

            SendResponse(res, HTTPStatusCode.OK, ResponseMessage.SUCCESS);
        } catch (err: unknown) {
            next(err);
        }
    }
}
