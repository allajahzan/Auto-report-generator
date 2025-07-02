import { IBatchDto, IParticipantDto } from "../../dtos/batch.dtos";
import { IBatchSchema } from "../../entities/batch.schema.interface";

// Interface for Batch Service 
export interface IBatchService {
    getBatch(groupId: string, coordinatorId: string): Promise<IBatchDto>;
    updateBatchDetails(groupId: string, coordinatorId: string, data: Partial<IBatchSchema>): Promise<void>;
    getParticipants(groupId: string, coordinatorId: string): Promise<IParticipantDto[] | void>;
    addParticipants(groupId: string, coordinatorId: string, participant: { id: string, name: string, phoneNumber: string, role: string }): Promise<void>;
    updateParicipants(groupId: string, coordinatorId: string, participant: { id: string, name: string, phoneNumber: string, role: string }): Promise<void>;
    selectGroup(groupId: string, coordinatorId: string, data: Partial<IBatchSchema>): Promise<void>;
    disconnect(groupId: string, coordinatorId: string): Promise<void>;
}
