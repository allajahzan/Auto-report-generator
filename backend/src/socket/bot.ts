import { Server, Socket } from "socket.io";
import http from "http";
import { startSocket } from "../bot/baileys";
import { getSocket } from "../bot/socket-store";
import { BatchRepository } from "../repository/implementation/batchRepository";
import Batch from "../model/batchSchema";

// io instance
let io: Server;
let activeUsers: Record<string, string> = {};

// Batch repository
const batchRepository = new BatchRepository(Batch);

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
                activeUsers[phoneNumber] = socket.id;
            });

            // Get started
            socket.on("get-started", (phoneNumber: string) => {
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
                    async (status, message) => {
                        const socketId = activeUsers[phoneNumber];
                        console.log(socketId, "socketId to emit BOT status");

                        if (socketId) {
                            io.to(socketId).emit("bot-status", status, message);
                        }

                        // If connected create a batch
                        if (status === "connected") {
                            const batch = await batchRepository.create({
                                coordinatorId: phoneNumber,
                            });
                        }
                    }
                );
            });

            // Get paricipants of a perticular group
            socket.on("get-participants", async (phoneNumber, groupId) => {
                // Baileys socket
                const sock = getSocket(phoneNumber);

                if (!sock) {
                    return io
                        .to(socket.id)
                        .emit(
                            "bot-status",
                            "error",
                            "Connection to report buddy is lost ⛓️‍💥"
                        );
                }

                const metadata = await sock.groupMetadata(groupId);

                // Participants
                const participants = await Promise.all(
                    metadata.participants
                        .filter((p) => !p.admin)
                        .map(async (p) => {
                            let profilePic = "";
                            try {
                                profilePic =
                                    (await sock.profilePictureUrl(p.id, "image")) || "";
                            } catch (err) {
                                profilePic = "";
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
            socket.on(
                "submit-group-and-participants",
                async (groupId, participants, phoneNumber) => {
                    // Baileys socket
                    const sock = getSocket(phoneNumber);

                    if (!sock) {
                        fn1(socket);
                        return;
                    }

                    // Batch
                    const batch = await batchRepository.findOne({
                        coordinatorId: phoneNumber,
                    });

                    if (!batch) {
                        fn1(socket);
                        return;
                    }

                    const coordinator = participants.find(
                        (parti: { name: string; phoneNumber: string }) =>
                            parti.phoneNumber === phoneNumber
                    );

                    const updatedBatch = await batchRepository.update(
                        { coordinatorId: phoneNumber },
                        { $set: { groupId, coordinator, participants } },
                        { new: true }
                    );

                    if (!updatedBatch) {
                        fn1(socket);
                        return;
                    }

                    io.to(socket.id).emit("submit-group-and-participants-result", true);
                }
            );
        });
    } catch (err: unknown) {
        console.log(err, "my errrroorrrrrrrrr");
    }
};

// Repeated function
function fn1(socket: Socket) {
    io.to(socket.id).emit("submit-group-and-participants-result", false);
    io.to(socket.id).emit(
        "bot-status",
        "error",
        "Connection to report buddy is lost ⛓️‍💥"
    );
}

// Export the socket.io instance
export const getIO = () => io;
export const getActiveUsers = (phoneNumber: string) => activeUsers[phoneNumber];
