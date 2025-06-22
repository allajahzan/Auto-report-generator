import { IBatchDto } from "../../dto/batchDto";

// Interface for Batch Service 
export interface IBatchService {
    getBatch(groupId: string, coordinatorId: string): Promise<IBatchDto>;
}
