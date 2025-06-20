import type { IGroup } from "@/components/auth/modal-select-group";
import { socket } from "./connection";

/**
 * Emits the "refresh-socket" event to the server with the given phone number.
 * This is used to refresh the socket connection after a page reload.
 * @param phoneNumber - Phone number to be passed to the server.
 */
export const refreshSocket = (phoneNumber: string) => {
    try {
        socket.emit("refresh-socket", phoneNumber);
    } catch (err: unknown) {
        console.log(err);
    }
};

/**
 * Emits the "get-started" event to the server with the given phone number.
 * This is used to start the QR code generation process.
 * @param phoneNumber - Phone number to be passed to the server.
 */
export const getStarted = (phoneNumber: string) => {
    try {
        socket.emit("get-started", phoneNumber);
    } catch (err: unknown) {
        console.log(err);
    }
};

/**
 * Listens for the "get-qrcode" event from the socket connection and executes the callback with the received QR code.
 * @param callback - Function to be called with the QR code string when the "get-qrcode" event is received.
 */
export const getQRcode = (callback: (qrCode: string) => void) => {
    try {
        socket.on("get-qrcode", (qrCode) => {
            callback(qrCode);
        });
    } catch (err: unknown) {
        console.log(err);
    }
};

/**
 * Listens for the "bot-status" event from the socket connection and executes the callback with the received bot status and message.
 * The status can be one of the following: "connected", "already-connected", "disconnected", "expired", "reconnecting", "error".
 * @param callback - Function to be called with the bot status and message when the "bot-status" event is received.
 */
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

export const groupList = (callback: (groupList: IGroup[]) => void) => {
    try {
        socket.on("group-list", (groupList: IGroup[]) => {
            callback(groupList);
        });
    } catch (err: unknown) {
        console.log(err);
    }
};

export const getParticipants = (phoneNumber: string, groupId: string) => {
    try {
        socket.emit("get-participants", phoneNumber, groupId);
    } catch (err: unknown) {
        console.log(err);
    }
};

export const pariticipantsList = (
    callback: (participants: { phoneNumber: string; name: string }[]) => void
) => {
    try {
        socket.on("participants-list", (paricipants) => {
            callback(paricipants);
        });
    } catch (err: unknown) {
        console.log(err);
    }
};
