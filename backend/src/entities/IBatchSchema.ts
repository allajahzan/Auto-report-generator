import { Document } from "mongoose";

// Interface for Batch Schema
export interface IBatchSchema extends Document {
    coordinatorId: string;
    groupId: string;
    batchName: string;
    participants: { id: string; name: string; phoneNumber: string , role: string }[];
    audioTaskTopic: string;
    isTrackingEnabled: boolean;
    isSharingEnabled: boolean;
    createdAt: Date;
}
