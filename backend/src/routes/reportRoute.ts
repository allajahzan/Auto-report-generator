import { Router } from "express";
import { ReportService } from "../service/implementation/reportService";
import { ReportController } from "../controller/implementation/reportController";
import { ReportRepository } from "../repository/implementation/reportRepository";
import Report from "../model/reportSchema";
import { checkBatch } from "../middleware/check-batch";

const router = Router();

// Dependency Injuction
const reportRepository = new ReportRepository(Report);
const reportService = new ReportService(reportRepository);
const reportController = new ReportController(reportService);

// Get report
router.get("/", checkBatch, (req, res, next) => {
    reportController.getReport(req, res, next);
});

// Update report information
router.patch("/", checkBatch, (req, res, next) => {
    reportController.updateReportInformation(req, res, next);
});

// Update report attendence
router.patch("/attendence", checkBatch, (req, res, next) => {
    reportController.updateReportAttendence(req, res, next);
});

export { router as reportRoute };
