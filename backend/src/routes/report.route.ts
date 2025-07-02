import { Router } from "express";
import { ReportRepository } from "../repository/implementations";
import { ReportService } from "../service/implementations";
import { ReportController } from "../controller/implementations";
import { Report } from "../models";
import { checkBatch } from "../middlewares";

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
