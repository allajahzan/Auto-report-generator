import type { IGroup } from "@/components/auth/modal-select-group";
import { socket } from "./connection";

// Emit to refresh socket
export const refreshSocket = (phoneNumber: string) => {
    try {
        socket.emit("refresh-socket", phoneNumber);
    } catch (err: unknown) {
        console.log(err);
    }
};

// Emit to get started
export const getStarted = (phoneNumber: string) => {
    try {
        socket.emit("get-started", phoneNumber);
    } catch (err: unknown) {
        console.log(err);
    }
};

// Listen for QR code
export const getQRcode = (callback: (qrCode: string) => void) => {
    try {
        socket.on("get-qrcode", (qrCode) => {
            callback(qrCode);
        });
    } catch (err: unknown) {
        console.log(err);
    }
};

// Listen for Bot status
export const botStatus = (
    callback: (
        status: "connected" | "re-connect" | "disconnected" | "expired" | "error",
        message: string
    ) => void
) => {
    try {
        socket.on("bot-status", (status, message) => {
            callback(status, message);
        });
    } catch (err: unknown) {
        console.log(err);
    }
};

// Listen for groups list
export const groupList = (callback: (groupList: IGroup[]) => void) => {
    try {
        socket.on("group-list", (groupList: IGroup[]) => {
            callback(groupList);
        });
    } catch (err: unknown) {
        console.log(err);
    }
};

// Emit to get participants
export const getParticipants = (phoneNumber: string, groupId: string) => {
    try {
        socket.emit("get-participants", phoneNumber, groupId);
    } catch (err: unknown) {
        console.log(err);
    }
};

// Listen for participants
export const pariticipantsList = (
    callback: (
        participants: { name: string; phoneNumber: string; profilePic: string }[]
    ) => void
) => {
    try {
        socket.on("participants-list", (paricipants) => {
            callback(paricipants);
        });
    } catch (err: unknown) {
        console.log(err);
    }
};

// Emit to submit selected group and participants details
export const submitGroupAndParticipants = (
    groupId: string,
    participants: { name: string; phoneNumber: string }[],
    phoneNumber: string
) => {
    try {
        socket.emit(
            "submit-group-and-participants",
            groupId,
            participants,
            phoneNumber
        );
    } catch (err: unknown) {
        console.log(err);
    }
};

// Listen for submit-group-and-participants event result
export const resultSubmitGroupAndParticipants = (
    callback: (status: boolean) => void
) => {
    try {
        socket.on("submit-group-and-participants-result", (status) => {
            callback(status);
        });
    } catch (err: unknown) {
        console.log(err);
    }
};
