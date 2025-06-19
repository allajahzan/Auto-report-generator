import { socket } from "./connection";

export const getQRcode = (callback: (qrCode: string) => void) => {
    try {
        socket.on("get-qrcode", (qrCode) => {
            callback(qrCode);
        });
    } catch (err: unknown) {
        throw err;
    }
};

export const botStatus = (
    callback: (
        status: "connected" | "disconnected" | "expired" | "reconnecting"
    ) => void
) => {
    try {
        socket.on("bot-status", (status) => {
            callback(status);
        });
    } catch (err: unknown) {
        throw err;
    }
};
