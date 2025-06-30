import { IReportDto } from "../../dto/reportDto";

// Interface for Report Service
export interface IReportService {
    getReport(batchId: string): Promise<IReportDto | null>
    updateReportInformation(batchId: string, data: Partial<IReportDto>): Promise<void>
    updateReportAttendence(batchId: string, data: Partial<IReportDto>): Promise<void>
}