import { BaseRepository } from "@codeflare/common";
import { Model } from "mongoose";
import { IBatchSchema } from "../../entities";
import { IBatchRepository } from "../interfaces";

// Implementation for Batch Repository 
export class BatchRepository
    extends BaseRepository<IBatchSchema>
    implements IBatchRepository {
    // Constructor
    constructor(model: Model<IBatchSchema>) {
        super(model);
    }
}
