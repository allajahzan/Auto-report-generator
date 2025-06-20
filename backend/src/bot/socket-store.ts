import { WASocket } from "@whiskeysockets/baileys";

const activeSockets: Record<string, WASocket> = {};

export const setSocket = (phoneNumber: string, sock: WASocket) => {
    activeSockets[phoneNumber] = sock;
};

export const getSocket = (phoneNumber: string): WASocket | undefined => {
    return activeSockets[phoneNumber];
};

export const removeSocket = (phoneNumber: string) => {
    delete activeSockets[phoneNumber];
};

export const getAllSockets = () => activeSockets;
