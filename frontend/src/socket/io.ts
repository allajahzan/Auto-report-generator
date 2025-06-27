import type { IGroup } from "@/components/auth/modal-select-group";
import { BASE_URL } from "@/constants/base-url";
import io from "socket.io-client";

export const socket = io(BASE_URL);

// Emit to refresh socket
export const refreshSocket = (phoneNumber: string) => {
    try {
        socket.emit("refresh-socket", phoneNumber);
    } catch (err) {
        console.log(err);
    }
};

// Emit to get started
export const getStarted = (phoneNumber: string) => {
    try {
        socket.emit("get-started", phoneNumber);
    } catch (err) {
        console.log(err);
    }
};

// Listen for QR code
export const getQRcode = (callback: (qrCode: string) => void) => {
    try {
        socket.on("get-qrcode", (qrCode) => {
            callback(qrCode);
        });
    } catch (err) {
        console.log(err);
    }
};

// Listen for Bot status
export const botStatus = (
    callback: (
        status: "connected" | "disconnected" | "expired" | "error",
        message: string,
        groupId?: string
    ) => void
) => {
    try {
        socket.on("bot-status", (status, message, groupId) => {
            callback(status, message, groupId);
        });
    } catch (err) {
        console.log(err);
    }
};

// Listen for groups list
export const groupList = (callback: (groupList: IGroup[]) => void) => {
    try {
        socket.on("group-list", (groupList: IGroup[]) => {
            callback(groupList);
        });
    } catch (err) {
        console.log(err);
    }
};
