import {
    makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import fs from "fs";
import { getIO } from "../socket/connection";

// Active users
const activeUsers: { [userId: string]: boolean } = {};

// Socket-io
const io = getIO();

// Start baileys socket
export const startSocket = async (
    userId: string,
    emitQR: (qr: string) => void,
    emitStatus: (
        status: "connected" | "disconnected" | "reconnecting" | "expired" | "error",
        message: string
    ) => void
) => {
    try {
        if (activeUsers[userId]) {
            console.log("❗ Socket already running for", userId);
            emitStatus("connected", "Reconnected to report buddy 👌");
            return;
        }

        // auth_info
        const authPath = `src/auth_info/${userId}`;
        const { state, saveCreds } = await useMultiFileAuthState(authPath);
        const sock = makeWASocket({ auth: state });

        // Save auth_info
        sock.ev.on("creds.update", async () => {
            await saveCreds();
        });

        let currentQR: string | null = null;
        let ATTEMPT = 5;
        let RETRIES = 0;

        // Connection
        sock.ev.on("connection.update", async(update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                if (currentQR && currentQR !== qr) {
                    // New QR generated, previous one expired
                    console.log("⏰ Previous QR expired.");
                    emitStatus("expired", "QR code is expired, get started again 🚀");
                    currentQR = null;
                    sock.ws.close();
                    return;
                }

                currentQR = qr;
                console.log("📸 QR is generated!");
                emitQR(qr);
            }

            if (connection === "open") {
                console.log("✅ Connected to BOT:", userId);
                activeUsers[userId] = true;

                emitStatus("connected", "Connected to report buddy 👏");

                // ✅ Fetch groups
                try {
                    const groups = await sock.groupFetchAllParticipating();
                    const groupList = Object.values(groups).map((group) => ({
                        id: group.id,
                        name: group.subject,
                    }));

                    console.log("📃 WhatsApp Groups:");
                    groupList.forEach((group) => {
                        console.log(`📌 ${group.name} — ${group.id}`);
                    });

                    io.emit("group-list", groupList);
                } catch (err) {
                    console.error("❌ Failed to fetch groups:", err);
                }
            }

            if (connection === "close") {
                delete activeUsers[userId];

                const reason = (lastDisconnect?.error as Boom)?.output?.statusCode;
                const isLoggedOut = reason === DisconnectReason.loggedOut;

                if (isLoggedOut) {
                    // Logged-out
                    console.log("🚪 Logged out from BOT:", userId);
                    fs.rmSync(authPath, { recursive: true, force: true });

                    emitStatus("disconnected", "Logged-out from report buddy 👎");
                } else {
                    // Only if currentQR available
                    if (currentQR) {
                        if (ATTEMPT > RETRIES) {
                            // Reconnecting...after 3s
                            console.log(" 🔃 Reconnecting...");
                            // emitStatus("reconnecting", "Reconnecting to report buddy 🔃");

                            setTimeout(() => {
                                startSocket(userId, emitQR, emitStatus);
                            }, 3000);

                            RETRIES++;
                        } else {
                            // Disconnected
                            console.log("🚪 Disconnected from BOT:", userId);
                            emitStatus("error", "Failed to reconnect to report buddy 💥");
                            return;
                        }
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
        emitStatus("error", "Failed to connect to report buddy 💥");
    }
};
