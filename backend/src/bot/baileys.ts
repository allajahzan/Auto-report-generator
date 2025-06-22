import makeWASocket, {
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    DisconnectReason,
} from "@whiskeysockets/baileys";
import P from "pino";
import { Boom } from "@hapi/boom";
import fs from "fs";
import { getActiveUsers, getIO } from "../socket/bot";
import { removeSocket, setSocket } from "./socket-store";

// Start baileys socket
export const startSocket = async (
    phoneNumber: string,
    emitQR: (qr: string) => void,
    emitStatus: (
        status: "connected" | "re-connect" | "disconnected" | "expired" | "error",
        message: string
    ) => void
) => {
    try {
        // auth_info
        const authPath = `src/auth_info/${phoneNumber}`;
        const { state, saveCreds } = await useMultiFileAuthState(authPath);

        const sock = makeWASocket({
            auth: state,
            version: (await fetchLatestBaileysVersion()).version,
            logger: P({ level: "silent" }),
            syncFullHistory: false,
            shouldSyncHistoryMessage: () => false,
        });

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
                console.log(connectedId);

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

                    console.log("📃 Fetched WhatsApp groups for:", phoneNumber);

                    const socketId = getActiveUsers(phoneNumber);
                    io.to(socketId).emit("group-list", groupList);
                } catch (err) {
                    console.error("❌ Failed to fetch WhatsApp groups for:", phoneNumber);
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
                        console.log(" 🔃 Reconnecting...:", phoneNumber);

                        setTimeout(() => {
                            startSocket(phoneNumber, emitQR, emitStatus);
                        }, 3000);

                        RETRIES++;
                    } else {
                        // Retries limit reached
                        console.log("⌛ Retries limit reached:", phoneNumber);
                        emitStatus("error", "Failed reconnecting to report buddy 🤧");
                    }
                }
            }
        });

        // New messages
        sock.ev.on("messages.upsert", async ({ messages, type }) => {
            if (type !== "notify" || !messages?.length) return;

            const msg = messages[0];
            const isFromMe = msg.key.fromMe;

            const actualSender = isFromMe
                ? sock.user?.id // your bot's number
                : msg.key.remoteJid;

            const phoneNo = actualSender?.split(":")[0].slice(2);
            const content =
                msg.message?.conversation || msg.message?.extendedTextMessage?.text;

            console.log("📩 Message:", {
                phoneNo,
                fromMe: isFromMe,
                content,
            });
        });
    } catch (err) {
        console.error("Error creating socket or during startup:", err);
        emitStatus("error", "Failed connecting to report buddy 🤧");
    }
};

// Start socket on server start
export const startSocketOnServerStart = () => {
    try {
        const authDir = "src/auth_info";
        const existingUsers = fs.readdirSync(authDir);

        for (const phoneNumber of existingUsers) {
            startSocket(
                phoneNumber,
                (qr) => { },
                (status, message) => { }
            );
        }
    } catch (err: unknown) {
        throw err;
    }
};
