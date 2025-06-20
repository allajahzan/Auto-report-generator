import { Server } from "socket.io";
import http from "http";
import { startSocket } from "../bot/baileys";
import { getSocket } from "../bot/socket-store";

// io instance
let io: Server;

let activeUsers: { [userId: string]: string } = {};

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

            // Refresh socket
            socket.on("refresh-socket", (phoneNumber: string) => {
                delete activeUsers[phoneNumber];
                console.log(phoneNumber + " refreshed socket");
                console.log(activeUsers);
            });

            // Get started
            socket.on("get-started", (phoneNumber: string) => {
                activeUsers[phoneNumber] = socket.id;
                console.log(phoneNumber + " get started with id " + socket.id);

                // Start baileys socket
                startSocket(
                    phoneNumber,
                    socket.id,
                    (qr) => {
                        const socketId = activeUsers[phoneNumber];
                        console.log(socketId, "socketId to emit QR code");

                        if (socketId) {
                            io.to(socketId).emit("get-qrcode", qr);
                        }
                    },
                    (status, message) => {
                        const socketId = activeUsers[phoneNumber];
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
                            "Connection lost with report buddy 💥"
                        );
                }

                const metadata = await sock.groupMetadata(groupId);

                const participants = await Promise.all(
                    metadata.participants
                        .filter((p) => !p.admin)
                        .map(async (p) => {
                            let profilePic = "";
                            try {
                                profilePic =
                                    (await sock.profilePictureUrl(p.id, "image")) || "";
                            } catch (err) {
                                profilePic = ""; // default
                            }

                            return {
                                name: p.name || "",
                                phoneNumber: p.id.split("@")[0].slice(2),
                                profilePic,
                            };
                        })
                );

                io.to(socket.id).emit("participants-list", participants);
            });

            // Submit group and participants details
            socket.on("submit-group-and-participants", (groupId, participants) => {
                console.log("submit-group-and-participants", groupId, participants);
            });
        });
    } catch (err: unknown) {
        console.log(err, "my errrroorrrrrrrrr");
    }
};

// Export the socket.io instance
export const getIO = () => io;
export const getActiveSockets = () => activeUsers;
