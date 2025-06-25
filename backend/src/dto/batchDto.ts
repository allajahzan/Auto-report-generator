// Dto for batch
export interface IBatchDto {
    coordinatorId: string;
    groupId: string;
    batchName: string;
    participants: {
        id: string;
        name: string;
        phoneNumber: string;
        profilePic: string;
        role: string;
    }[];
    createdAt: Date;
}
