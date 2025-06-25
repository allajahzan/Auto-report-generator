// Inteface for Batch
export interface IBatch {
    _id: string;
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
    audioTaskTopic: string;
    isTrackingEnabled: boolean;
    isSharingEnabled: boolean;
    createdAt: Date;
}
