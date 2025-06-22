import { BaseRepository } from "@codeflare/common";
import { IBatchRepository } from "../interface/IBatchRepository";
import { IBatchSchema } from "../../entities/IBatchSchema";
import { Model } from "mongoose";

// Implementation for Batch Repository 
export class BatchRepository
    extends BaseRepository<IBatchSchema>
    implements IBatchRepository {
    // Constructor
    constructor(model: Model<IBatchSchema>) {
        super(model);
    }
}
