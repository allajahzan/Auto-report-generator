import { IBaseRepository } from "@codeflare/common";
import { IReportSchema } from "../../entities/IReportSchema";
import { FilterQuery, QueryOptions, UpdateQuery } from "mongoose";

// Interface for Report Repository
export interface IReportRepository extends IBaseRepository<IReportSchema> {
    findOneAndUpdate(query: FilterQuery<IReportSchema>, update: UpdateQuery<IReportSchema>, options?: QueryOptions): Promise<IReportSchema | null>;
}
