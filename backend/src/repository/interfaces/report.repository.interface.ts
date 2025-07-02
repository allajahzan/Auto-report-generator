import { IBaseRepository } from "@codeflare/common";
import { FilterQuery, QueryOptions, UpdateQuery } from "mongoose";
import { IReportSchema } from "../../entities";

// Interface for Report Repository
export interface IReportRepository extends IBaseRepository<IReportSchema> {
    findOneAndUpdate(query: FilterQuery<IReportSchema>, update: UpdateQuery<IReportSchema>, options?: QueryOptions): Promise<IReportSchema | null>;
}
