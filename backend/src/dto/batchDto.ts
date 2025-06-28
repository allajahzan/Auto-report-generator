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
    isTrackingEnabled: boolean;
    isSharingEnabled: boolean;
    createdAt: Date;
}

// Dto for participants
export interface IParticipantDto {
    id: string;
    name: string;
    phoneNumber: string;
    profilePic: string;
    role: string;
}
