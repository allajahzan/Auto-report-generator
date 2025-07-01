import { Schema, model } from "mongoose";
import { IBatchSchema } from "../entities";

// Implementation of Batch Schema
const batchSchema = new Schema<IBatchSchema>(
    {
        coordinatorId: {
            type: String,
            unique: true,
            index: true,
        },
        groupId: {
            type: String,
            unique: true,
            index: true,
        },
        batchName: {
            type: String,
            unique: true,
        },
        participants: {
            type: [
                {
                    id: {
                        type: String,
                    },
                    name: {
                        type: String,
                    },
                    phoneNumber: {
                        type: String,
                    },
                    role: {
                        type: String,
                    },
                },
            ],
            default: [],
        },
        isTrackingEnabled: {
            type: Boolean,
            default: false,
        },
        isSharingEnabled: {
            type: Boolean,
            default: false,
        },
        createdAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

export const Batch = model<IBatchSchema>("Batch", batchSchema);
