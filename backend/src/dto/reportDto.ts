// Dto for report
export interface IReportDto {
    _id: string;
    batchId: string;
    date: string;
    taskReport: {
        id: string;
        name: string;
        phoneNumber: string;
        isCompleted: boolean;
        timestamp: Date;
    }[];
    taskType: string;
    taskTopic: string;
}