import { Schema, model } from "mongoose";
import { IBatchSchema } from "../entities/IBatchSchema";

/** Implementation of Batch Schema */
const batchSchema = new Schema<IBatchSchema>({
    coordinatorId: {
        type: String,
        required: true,
        unique: true
    },
    groupId: {
        type: String,
        unique: true
    },
    batchName: {
        type: String,
        unique: true
    },
    coordinator: {
        type: {
            name: {
                type: String,
            },
            phoneNumber: {
                type: String,
            },
        },
    },
    participants: {
        type: [
            {
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
                isDone: {
                    type: Boolean,
                    default: false,
                },
            },
        ],
        default: [],
    },
});

const Batch = model<IBatchSchema>("Batch", batchSchema);
export default Batch;
