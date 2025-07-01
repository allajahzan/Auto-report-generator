import { WASocket } from "@whiskeysockets/baileys";

const activeSockets: Record<string, WASocket> = {};

// Set socket
export const setSocket = (phoneNumber: string, sock: WASocket) => {
    activeSockets[phoneNumber] = sock;
};

// Get socket
export const getSocket = (phoneNumber: string): WASocket | undefined => {
    return activeSockets[phoneNumber];
};

// Remove socket
export const removeSocket = (phoneNumber: string) => {
    delete activeSockets[phoneNumber];
};

export const getAllSockets = () => activeSockets;
