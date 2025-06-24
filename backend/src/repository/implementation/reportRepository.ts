import { BaseRepository } from "@codeflare/common";
import { IReportRepository } from "../interface/IReportRepository";
import { IReportSchema } from "../../entities/IReportSchema";
import { Model } from "mongoose";

// Implementation for Report Repository 
export class ReportRepository
    extends BaseRepository<IReportSchema>
    implements IReportRepository {
    // Constructor
    constructor(model: Model<IReportSchema>) {
        super(model);
    }
}
