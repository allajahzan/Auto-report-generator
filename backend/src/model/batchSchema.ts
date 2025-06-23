import { Schema, model } from "mongoose";
import { IBatchSchema } from "../entities/IBatchSchema";

// Implementation of Batch Schema
const batchSchema = new Schema<IBatchSchema>(
    {
        coordinatorId: {
            type: String,
            required: true,
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
        audioTaskTopic: {
            type: String,
        },
        isTrackingEnabled: {
            type: Boolean,
            default: false,
        },
        isSchedulingEnabled: {
            type: Boolean,
            default: false,
        },
        createdAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

const Batch = model<IBatchSchema>("Batch", batchSchema);
export default Batch;
