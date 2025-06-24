// Interface for Report
export interface IReport {
    _id: string;
    batchId: string;
    date: Date;
    audioTaskReport: {
        id: string;
        name: string;
        phoneNumber: string;
        isCompleted: boolean;
        timestamp: Date;
    }[];
}
