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
        isMarked: boolean;
        isCompleted: boolean;
    }[];
    createdAt: Date;
}
