import { Document, Schema } from "mongoose";

// Interface for Report Schema
export interface IReportSchema extends Document {
    batchId: Schema.Types.ObjectId;
    date: Date;
    audioTaskReport: {
        id: string;
        name: string;
        phoneNumber: string;
        isCompleted: boolean;
        timestamp: Date;
    }[];
}
