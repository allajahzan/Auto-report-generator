import { Document } from "mongoose";

// Interface for Batch Schema
export interface IBatchSchema extends Document {
    coordinatorId: string;
    groupId: string;
    batchName: string;
    participants: { id: string; name: string; phoneNumber: string }[];
    audioTaskReport: {
        name: string;
        phoneNumber: string;
        isCompleted: boolean;
        timestamp: Date;
    }[];
    createdAt: Date;
}
