import { Socket, Server } from "socket.io";
import { startBaileysSocket } from "../bot";

let activeUsers: Record<string, string> = {};

// Notification socket
export const notificationSocket = (socket: Socket, io: Server) => {
    try {
        // Refresh socket
        socket.on("refresh-socket", (phoneNumber: string) => {
            console.log("socket-io refreshed", phoneNumber);
            activeUsers[phoneNumber] = socket.id;
        });

        // Get started
        socket.on("get-started", async (phoneNumber: string) => {
            try {
                activeUsers[phoneNumber] = socket.id;
                console.log(phoneNumber + " get started with id " + socket.id);

                // Start baileys socket
                startBaileysSocket(
                    phoneNumber,
                    (qr) => {
                        const socketId = activeUsers[phoneNumber];
                        console.log(socketId, "socketId to emit QR code");

                        if (socketId) {
                            io.to(socketId).emit("get-qrcode", qr);
                        }
                    },
                    async (status, message, groupId) => {
                        const socketId = activeUsers[phoneNumber];
                        console.log(socketId, "socketId to emit BOT status");

                        if (socketId) {
                            io.to(socketId).emit("bot-status", status, message, groupId);
                        }
                    }
                );
            } catch (err) {
                const socketId = activeUsers[phoneNumber];

                if (socketId) {
                    socket
                        .to(socketId)
                        .emit(
                            "bot-status",
                            "error",
                            "Failed connecting to Report Buddy 🤧"
                        );
                }
            }
        });
    } catch (err) {
        console.log(err, "my error");
    }
};

// Export active users
export const getActiveUsers = (phoneNumber: string) => activeUsers[phoneNumber];
