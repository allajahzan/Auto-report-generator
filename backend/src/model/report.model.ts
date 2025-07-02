import { model, Schema } from "mongoose";
import { IReportSchema } from "../entities";

// Implementation of Report Schema
const reportSchema = new Schema<IReportSchema>({
    batchId: {
        type: String,
        required: true,
    },
    date: {
        type: String,
        required: true,
    },
    taskReport: {
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
                isCompleted: {
                    type: Boolean,
                },
                messageID:{
                    type: String
                },
                timestamp: {
                    type: Date
                }
            },
        ],
    },
    taskType: {
        type: String,
    },
    taskTopic : {
        type: String
    }
});

export const Report = model<IReportSchema>("Report", reportSchema);
