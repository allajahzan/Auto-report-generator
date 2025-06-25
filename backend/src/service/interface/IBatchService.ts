import { IBatchDto } from "../../dto/batchDto";
import { IBatchSchema } from "../../entities/IBatchSchema";

// Interface for Batch Service 
export interface IBatchService {
    getBatch(groupId: string, coordinatorId: string): Promise<IBatchDto>;
    updateBatchDetails(groupId: string, coordinatorId: string, data: Partial<IBatchSchema>): Promise<void>;
    updateParicipants(groupId: string, coordinatorId: string, participant: { id: string, name: string, phoneNumber: string, role: string }): Promise<void>;
}
