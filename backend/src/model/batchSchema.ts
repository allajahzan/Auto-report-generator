import { Schema, model } from "mongoose";
import { IBatchSchema } from "../entities/IBatchSchema";

// Implementation of Batch Schema
const batchSchema = new Schema<IBatchSchema>(
    {
        coordinatorId: {
            type: String,
            required: true,
            unique: true,
        },
        groupId: {
            type: String,
            unique: true,
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
                },
            ],
            default: [],
        },
        audioTaskReport: {
            type: [
                {
                    name: {
                        type: String,
                    },
                    phoneNumber: {
                        type: String,
                    },
                    isMarked: {
                        type: Boolean,
                        default: false,
                    },
                    isCompleted: {
                        type: Boolean,
                        default: false,
                    },
                },
            ],
            default: [],
        },
        createdAt: {
            type: Date,
        },
    },
    { timestamps: true }
);

const Batch = model<IBatchSchema>("Batch", batchSchema);
export default Batch;
