import { Document, Schema } from "mongoose";

// Interface for Report Schema
export interface IReportSchema extends Document {
    batchId: string;
    date: string;
    audioTaskReport: {
        id: string;
        name: string;
        phoneNumber: string;
        isCompleted: boolean;
        timestamp: Date;
    }[];
    taskType: string;
    taskTopic: string;
}
