import { socket } from "./connection";

export const refreshSocket = (phoneNumber: string) => {
    try {
        socket.emit("refresh-socket", phoneNumber);
    } catch (err: unknown) {
        console.log(err);
    }
};

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
        status:
            | "connected"
            | "already-connected"
            | "disconnected"
            | "expired"
            | "reconnecting"
            | "error",
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
