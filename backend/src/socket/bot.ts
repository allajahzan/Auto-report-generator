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
                activeUsers[phoneNumber] = socket.id;
            });

            // Get started
            socket.on("get-started", (phoneNumber: string) => {
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
                } catch (err: unknown) {
                    throw err;
                }
            });

            // Get paricipants of a perticular group
            socket.on("get-participants", async (phoneNumber, groupId) => {
                try {
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
                            // .filter((p) => !p.admin)
                            .map(async (p) => {
                                let profilePic = "";
                                try {
                                    profilePic =
                                        (await sock.profilePictureUrl(p.id, "image")) || "";
                                } catch (err) {
                                    profilePic = "";
                                }

                                return {
                                    id: p.id,
                                    name: p.name || "",
                                    phoneNumber: p.id.split("@")[0].slice(2),
                                    profilePic,
                                };
                            })
                    );

                    io.to(socket.id).emit("participants-list", participants);
                } catch (err: unknown) {
                    throw err;
                }
            });

            // Submit group and participants details
            socket.on(
                "submit-group-and-participants",
                async (groupId, participants, phoneNumber) => {
                    try {
                        // Baileys socket
                        const sock = getSocket(phoneNumber);

                        if (!sock) {
                            return fn1(socket);
                        }

                        // Batch
                        const isBatchExistOfGroupId = await batchRepository.findOne({
                            groupId,
                        });

                        if (
                            isBatchExistOfGroupId &&
                            isBatchExistOfGroupId.coordinatorId !== phoneNumber
                        ) {
                            return fn1(
                                socket,
                                "conflict",
                                "This group is already connected by another coordinator 🤥"
                            );
                        }

                        // Batch
                        const batch = await batchRepository.findOne({
                            coordinatorId: phoneNumber,
                        });

                        if (!batch) {
                            return fn1(socket);
                        }

                        const updatedBatch = await batchRepository.update(
                            { coordinatorId: phoneNumber },
                            { $set: { groupId, participants } },
                            { new: true }
                        );

                        if (!updatedBatch) {
                            return fn1(socket);
                        }

                        io.to(socket.id).emit("submit-group-and-participants-result", true);
                    } catch (err: unknown) {
                        throw err;
                    }
                }
            );
        });
    } catch (err: unknown) {
        console.log(err, "my error");
    }
};

// Repeated function
function fn1(socket: Socket, error?: string, message?: string) {
    try {
        io.to(socket.id).emit("submit-group-and-participants-result", false);
        io.to(socket.id).emit(
            "bot-status",
            error ? error : "error",
            message ? message : "Connection to report buddy is lost ⛓️‍💥"
        );
    } catch (err: unknown) {
        throw err;
    }
}

// Export the socket.io instance
export const getIO = () => io;
export const getActiveUsers = (phoneNumber: string) => activeUsers[phoneNumber];
