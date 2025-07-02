import { BaseRepository } from "@codeflare/common";
import { FilterQuery, Model, QueryOptions, UpdateQuery } from "mongoose";
import { IReportSchema } from "../../entities";
import { IReportRepository } from "../interfaces";

// Implementation for Report Repository
export class ReportRepository
    extends BaseRepository<IReportSchema>
    implements IReportRepository {
    // Constructor
    constructor(model: Model<IReportSchema>) {
        super(model);
    }

    // Find one and update
    async findOneAndUpdate(
        query: FilterQuery<IReportSchema>,
        update: UpdateQuery<IReportSchema>,
        options?: QueryOptions
    ): Promise<IReportSchema | null> {
        return this.model.findOneAndUpdate(query, update, options);
    }
}
