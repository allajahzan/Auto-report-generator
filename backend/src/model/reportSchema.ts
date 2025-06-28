import { model, Schema } from "mongoose";
import { IReportSchema } from "../entities/IReportSchema";

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
    audioTaskReport: {
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

const Report = model<IReportSchema>("Report", reportSchema);
export default Report;
