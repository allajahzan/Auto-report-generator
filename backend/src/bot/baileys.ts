import {
    makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import fs from "fs";
import { getIO } from "../socket/connection";

const students = [
    {
        name: "Ahsan allaj pk",
        phoneNo: "7034661353",
    },
    {
        name: "Ummachi",
        phoneNo: "9605212846",
    },
];

const activeUsers: { [userId: string]: boolean } = {};

// Start baileys socket
export const startSocket = async (
    userId: string,
    emitQR: (qr: string) => void,
    emitStatus: (
        status:
            | "connected"
            | "already-connected"
            | "disconnected"
            | "expired"
            | "reconnecting"
            | "error",
        message: string
    ) => void
) => {
    try {
        if (activeUsers[userId]) {
            console.log("❗ Socket already running for", userId);
            emitStatus("already-connected", "Reconnected to report buddy 👌");
            return;
        }

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

        sock.ev.on("connection.update", (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr) {
                if (currentQR && currentQR !== qr) {
                    // New QR received, previous one expired
                    console.log("⏰ Previous QR expired.");
                    emitStatus("expired", "This QR code expired, get started again 🚀");
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
            }

            if (connection === "close") {
                const reason = (lastDisconnect?.error as Boom)?.output?.statusCode;

                const isLoggedOut = reason === DisconnectReason.loggedOut;

                if (isLoggedOut) {
                    // Logged-out
                    console.log("🚪 Logged out from BOT:", userId);
                    fs.rmSync(authPath, { recursive: true, force: true });

                    emitStatus("disconnected", "Logged-out from report buddy 👎");
                } else {
                    if (currentQR) { // Only if currentQR available
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

                const student = students.find((std) => std.phoneNo === phoneNo);

                // if (!isMe) {
                console.log(student?.name, "Message:", msg.message);
                // }
            }
        });
    } catch (err) {
        console.error("💥 Error creating socket or during startup:", err);
        emitStatus("error", "Failed to connect to report buddy 💥");
    }
};
