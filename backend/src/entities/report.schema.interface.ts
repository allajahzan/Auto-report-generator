import { Document, Schema } from "mongoose";

// Interface for Report Schema
export interface IReportSchema extends Document {
    batchId: string;
    date: string;
    taskReport: {
        id: string;
        name: string;
        phoneNumber: string;
        isCompleted: boolean;
        messageID: string;
        timestamp: Date;
    }[];
    taskType: string;
    taskTopic: string;
}
