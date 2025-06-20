import {
    makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import fs from "fs";
import { getIO } from "../socket/connection";
import { removeSocket, setSocket } from "./socket-store";

// Start baileys socket
export const startSocket = async (
    phoneNumber: string,
    socketId: string,
    emitQR: (qr: string) => void,
    emitStatus: (
        status: "connected" | "re-connect" | "disconnected" | "expired" | "error",
        message: string
    ) => void
) => {
    try {
        // if (activeUsers[phoneNumber]) {
        //     console.log("❗ Socket already running for", phoneNumber);
        //     emitStatus("re-connect", "Reconnected to report buddy 👌");
        //     return;
        // }

        // auth_info
        const authPath = `src/auth_info/${phoneNumber}`;
        const { state, saveCreds } = await useMultiFileAuthState(authPath);
        const sock = makeWASocket({ auth: state });

        // Save auth_info
        sock.ev.on("creds.update", async () => {
            await saveCreds();
        });

        const io = getIO();
        let currentQR: string | null = null;
        let ATTEMPT = 5;
        let RETRIES = 0;

        let connectedId;

        // Connection
        sock.ev.on("connection.update", async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                if (currentQR && currentQR !== qr) {
                    // New QR generated, previous one expired
                    console.log("⏰ Previous QR expired.");
                    emitStatus("expired", "QR code is expired, now get started again 🚀");
                    currentQR = null;

                    try {
                        fs.rmSync(authPath, { recursive: true, force: true });
                    } catch (err: unknown) {
                        console.log(err, "Failed to delete auth_info");
                    }

                    sock.ws.close();
                    return;
                }

                currentQR = qr;
                console.log("📸 QR is generated!");
                emitQR(qr);
            }

            connectedId = sock.user?.id;

            // Open connection
            if (connection === "open") {
                const connectedPhone = connectedId?.split(":")[0].slice(2);

                if (connectedPhone !== phoneNumber) {
                    emitStatus(
                        "error",
                        "Scanned WhatsApp doesn't match provided phone number 😒"
                    );

                    // Logout completely
                    try {
                        await sock.logout();
                    } catch (err) {
                        console.log("Failed to logout:", err);
                    }

                    return;
                }

                console.log("✅ Connected to BOT:", phoneNumber);
                setSocket(phoneNumber, sock);

                emitStatus("connected", "Successfully connected to report buddy 👏");

                // Fetch groups
                try {
                    const groups = await sock.groupFetchAllParticipating();

                    const groupList = await Promise.all(
                        Object.values(groups)
                            .filter((group) => {
                                const name = group.subject.toLowerCase();
                                return (
                                    name.includes("communication") ||
                                    name.includes("bce") ||
                                    name.includes("bck")
                                );
                            })
                            .map(async (group) => {
                                let profilePic = "";
                                try {
                                    profilePic =
                                        (await sock.profilePictureUrl(group.id, "image")) || "";
                                } catch (err) {
                                    profilePic = ""; // default
                                }

                                return {
                                    id: group.id,
                                    name: group.subject,
                                    profilePic,
                                };
                            })
                    );

                    console.log("📃 WhatsApp Groups:");

                    io.to(socketId).emit("group-list", groupList);
                } catch (err) {
                    console.error("❌ Failed to fetch groups:", err);
                }
            }

            // Closed connection
            if (connection === "close") {
                removeSocket(phoneNumber);

                const reason = (lastDisconnect?.error as Boom)?.output?.statusCode;

                // Timeout
                if (reason === DisconnectReason.timedOut) {
                    emitStatus("error", "Request timed out. Try again later ⏱️");
                }

                // Closed
                if (reason === DisconnectReason.connectionClosed) {
                    console.log("Connection closed");
                }

                // Forbidden
                if (reason === DisconnectReason.forbidden) {
                    emitStatus(
                        "error",
                        "Scanned WhatsApp doesn't match provided phone number 😒"
                    );
                }

                // Logged-out
                if (reason === DisconnectReason.loggedOut) {
                    const connectedPhone = connectedId?.split(":")[0].slice(2);

                    console.log("🚪 Logged out from BOT:", phoneNumber);

                    setTimeout(() => {
                        try {
                            fs.rmSync(authPath, { recursive: true, force: true });
                        } catch (err: unknown) {
                            console.log(err, "Failed to delete auth_info");
                        }
                    }, 3000);

                    if (connectedPhone === phoneNumber) {
                        emitStatus(
                            "disconnected",
                            "You have been logged-out from report buddy 👎"
                        );
                    }
                }

                // Restart
                if (reason === DisconnectReason.restartRequired) {
                    if (ATTEMPT > RETRIES) {
                        console.log(" 🔃 Reconnecting...");

                        setTimeout(() => {
                            startSocket(phoneNumber, socketId, emitQR, emitStatus);
                        }, 3000);

                        RETRIES++;
                    } else {
                        // Retries limit reached
                        console.log("🚪 Disconnected from BOT:", phoneNumber);
                        emitStatus("error", "Failed reconnecting to report buddy 💥");
                    }
                }
            }
        });

        // New messages
        sock.ev.on("messages.upsert", async ({ messages, type }) => {
            if (type === "notify" && messages[0].message) {
                const msg = messages[0];
                const senderId = msg.key.remoteJid;
                const isMe = msg.key.fromMe;
                const phoneNo = senderId?.split("@")[0].slice(2);

                console.log("Message:", msg.message);
            }
        });
    } catch (err) {
        console.error("💥 Error creating socket or during startup:", err);
        emitStatus("error", "Failed connecting to report buddy 💥");
    }
};
