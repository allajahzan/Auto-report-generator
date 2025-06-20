import { Server } from "socket.io";
import http from "http";
import { startSocket } from "../bot/baileys";
import { getSocket } from "../bot/socket-store";

// io instance
let io: Server;

let activeSockets: { [userId: string]: string } = {};

/**
 * Connects socket.io to the server and sets up the chat, and video call sockets also notification events.
 * @param server - The server to connect socket.io to.
 */
export const connectSocketIO = (server: http.Server) => {
    try {
        io = new Server(server, {
            cors: {
                origin: process.env.CLIENT_URL,
            },
        });

        io.on("connection", (socket) => {
            console.log("Socket-io connected with id", socket.id);

            // Get started
            socket.on("get-started", (phoneNumber: string) => {
                activeSockets[phoneNumber] = socket.id;
                console.log(phoneNumber + " get started with id " + socket.id);

                // Start baileys socket
                startSocket(
                    phoneNumber,
                    socket.id,
                    (qr) => {
                        const socketId = activeSockets[phoneNumber];
                        console.log(socketId, "socketId to emit QR code");

                        if (socketId) {
                            io.to(socketId).emit("get-qrcode", qr);
                        }
                    },
                    (status, message) => {
                        const socketId = activeSockets[phoneNumber];
                        console.log(socketId, "socketId to emit BOT status");

                        if (socketId) {
                            io.to(socketId).emit("bot-status", status, message);
                        }
                    }
                );
            });

            // Get paricipants of a perticular group
            socket.on("get-participants", async (phoneNumber, groupId) => {
                const sock = getSocket(phoneNumber);

                if (!sock) {
                    return io
                        .to(socket.id)
                        .emit(
                            "bot-status",
                            "error",
                            "Connection failed in report buddy 💥"
                        );
                }

                const metadata = await sock.groupMetadata(groupId);

                const participants = metadata.participants
                    .filter((p) => !p.admin)
                    .map((p) => ({
                        phoneNumber: p.id.split("@")[0].slice(2),
                        name: p.name || "",
                    }));

                io.to(socket.id).emit("participants-list", participants);
            });

            // Refresh socket
            socket.on("refresh-socket", (phoneNumber: string) => {
                delete activeSockets[phoneNumber];
                console.log(phoneNumber + " refreshed socket");
                console.log(activeSockets);
            });
        });
    } catch (err: unknown) {
        console.log(err, "my errrroorrrrrrrrr");
    }
};

// Export the socket.io instance
export const getIO = () => io;
export const getActiveSockets = () => activeSockets;
