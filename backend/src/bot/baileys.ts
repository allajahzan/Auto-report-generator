import {
    makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import fs from "fs";

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
        status: "connected" | "disconnected" | "expired" | "reconnecting"
    ) => void
) => {
    if (activeUsers[userId]) {
        console.log("❗ Socket already running for", userId);
        emitStatus("connected");
        return;
    }

    activeUsers[userId] = true;

    const authPath = `src/auth_info/${userId}`;
    const { state, saveCreds } = await useMultiFileAuthState(authPath);
    const sock = makeWASocket({ auth: state });

    let qrTimeout: NodeJS.Timeout | null = null;
    let isExpired = false;

    // Save auth_info
    sock.ev.on("creds.update", async () => {
        await saveCreds();
    });

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr && !isExpired) {
            console.log("📸 QR is generated!");
            emitQR(qr);

            // Expire
            qrTimeout = setTimeout(() => {
                isExpired = true;
                emitStatus("expired");
                activeUsers[userId] = false;
                console.log("💥 QR is Expired!");
                return;

                // try {
                //     sock.end(new Boom("QR expired", { statusCode: 408 }));
                // } catch { }
            }, 30_000);
        }

        if (connection === "open") {
            console.log("✅ Connected to BOT:", userId);
            if (qrTimeout) clearTimeout(qrTimeout);
            isExpired = false;
            emitStatus("connected");
        }

        if (connection === "close") {
            const reason = (lastDisconnect?.error as Boom)?.output?.statusCode;

            const isLoggedOut = reason === DisconnectReason.loggedOut;

            if (qrTimeout) clearTimeout(qrTimeout);
            activeUsers[userId] = false;

            if (isLoggedOut) {
                // Logged-out
                console.log("🚪 Logged out from BOT:", userId);
                fs.rmSync(authPath, { recursive: true, force: true });

                emitStatus("disconnected");
            } else {
                // Reconnecting...after 3s
                console.log(" 🔃 Reconnecting...");
                emitStatus("reconnecting");

                setTimeout(() => {
                    startSocket(userId, emitQR, emitStatus);
                }, 3000);
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
};
