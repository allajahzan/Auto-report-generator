import { BadRequestError, ForbiddenError } from "@codeflare/common";
import { IReportService } from "../interface";
import { IReportRepository } from "../../repository/interface";
import { IReportDto } from "../../dtos";
import { getSocket } from "../../bot";
import { sendTaskReport } from "../../utils/sendReport";

// Implementation for Report Service
export class ReportService implements IReportService {
    private reportRepository: IReportRepository;

    constructor(reportRepository: IReportRepository) {
        this.reportRepository = reportRepository;
    }

    // Get report
    async getReport(batchId: string): Promise<IReportDto | null> {
        try {
            // Correct date with proper timezone
            const now = new Date();
            const istDate = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
            const dateStr = istDate.toISOString().split("T")[0]; // "2025-06-28"

            const report = await this.reportRepository.findOne({
                batchId,
                date: dateStr,
            });

            if (!report) return null;

            // Map data to return type
            const reportDto: IReportDto = {
                _id: report._id as unknown as string,
                batchId: report.batchId,
                date: report.date,
                taskReport: report.taskReport.map((sr) => ({
                    id: sr.id,
                    name: sr.name,
                    phoneNumber: sr.phoneNumber,
                    isCompleted: sr.isCompleted,
                    timestamp: sr.timestamp,
                })),
                taskType: report.taskType,
                taskTopic: report.taskTopic,
            };

            return reportDto;
        } catch (err: unknown) {
            throw err;
        }
    }

    // Update report information
    async updateReportInformation(
        batchId: string,
        data: Partial<IReportDto>
    ): Promise<void> {
        try {
            // Correct date with proper timezone
            const now = new Date();
            const istDate = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
            const dateStr = istDate.toISOString().split("T")[0]; // "2025-06-28"

            const updatedReport = await this.reportRepository.update(
                { batchId, date: dateStr },
                { $set: data },
                { upsert: true, new: true }
            );

            if (!updatedReport)
                throw new BadRequestError("Failed to update task information");
        } catch (err: unknown) {
            throw err;
        }
    }

    // Update report attendence
    async updateReportAttendence(
        batchId: string,
        coordinatorId: string,
        data: Partial<IReportDto>
    ): Promise<void> {
        try {
            const phoneNumber = coordinatorId;
            const sock = getSocket(phoneNumber);
            if (!sock) throw new ForbiddenError();

            // Current IST time
            const now = new Date();
            const istOffsetMs = 5.5 * 60 * 60 * 1000;
            const istNow = new Date(now.getTime() + istOffsetMs);

            // Only allow update if time is after 22:00 (10:00 PM)
            const currentHours = istNow.getHours();
            const currentMinutes = istNow.getMinutes();

            if (currentHours < 22 || (currentHours === 22 && currentMinutes < 0)) {
                throw new BadRequestError(
                    "Attendence can only be updated after 10:00 PM"
                );
            }

            // Format date
            const dateStr = istNow.toISOString().split("T")[0]; // "2025-06-28"

            const isReportExist = await this.reportRepository.findOne({
                batchId,
                date: dateStr,
            });

            if (!isReportExist)
                throw new BadRequestError("You have to add task information first");

            const updatedReport = await this.reportRepository.update(
                { batchId, date: dateStr },
                { $set: data }
            );

            if (!updatedReport)
                throw new BadRequestError("Failed to update task attendence");

            // Send task report in WhatsApp Group
            sendTaskReport(phoneNumber, sock, false);
        } catch (err: unknown) {
            throw err;
        }
    }
}
