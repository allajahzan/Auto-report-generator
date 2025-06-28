import { Server } from "socket.io";
import http from "http";
import { startSocket } from "../bot/baileys";

// io instance
let io: Server;
let activeUsers: Record<string, string> = {};

// Connect socket io
export const connectSocketIO = (server: http.Server) => {
    try {
        io = new Server(server, {
            cors: {
                origin: process.env.CLIENT_URL,
            },
        });

        io.on("connection", (socket) => {
            console.log("Socket-io connected with id", socket.id);

            // Refresh socket
            socket.on("refresh-socket", (phoneNumber: string) => {
                console.log("socket-io refreshed:", phoneNumber);
                activeUsers[phoneNumber] = socket.id;
            });

            // Get started
            socket.on("get-started", async (phoneNumber: string) => {
                try {
                    activeUsers[phoneNumber] = socket.id;
                    console.log(phoneNumber + " get started with id " + socket.id);

                    // Start baileys socket
                    startSocket(
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
                        io.to(socketId).emit(
                            "bot-status",
                            "error",
                            "Failed connecting to Report Buddy 🤧"
                        );
                    }
                }
            });
        });
    } catch (err) {
        console.log(err, "my error");
    }
};

// Export the socket.io instance
export const getIO = () => io;
export const getActiveUsers = (phoneNumber: string) => activeUsers[phoneNumber];
