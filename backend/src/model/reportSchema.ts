import { model, Schema } from "mongoose";
import { IReportSchema } from "../entities/IReportSchema";

// Implementation of Report Schema
const reportSchema = new Schema<IReportSchema>({
    batchId: {
        type: Schema.Types.ObjectId,
        ref: "Batch",
        required: true,
    },
    date: {
        type: Date,
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
});

const Report = model<IReportSchema>("Report", reportSchema);
export default Report;
