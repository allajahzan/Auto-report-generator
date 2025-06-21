import { Document } from "mongoose";

/** Interface for Batch Schema */
export interface IBatchSchema extends Document {
    coordinatorId: string;
    groupId: string;
    batchName: string;
    coordinator: { name: string; phoneNumber: string };
    participants: { name: string; phoneNumber: string }[];
    audioTaskReport: { name: string; phoneNumber: string; isDone: boolean }[];
}
