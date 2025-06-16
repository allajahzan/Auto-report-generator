import {
    makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import qrcode from "qrcode-terminal";
import fs from "fs";
import path from "path";

const isGroupID = true;

const students = [
    {
        name: "Ahsan allaj pk",
        phoneNo: "7034661353",
    },
    {
        name: "Anshad",
        phoneNo: "9834671253",
    },
];

// Start baileys socket
export const startSocket = async () => {
    const { state, saveCreds } = await useMultiFileAuthState("src/auth_info");

    const socket = makeWASocket({
        auth: state,
    });

    socket.ev.on("creds.update", saveCreds);

    // Connection
    socket.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log("Scan this qr code:", qr);
            qrcode.generate(qr, { small: true });
        }

        if (connection === "close") {
            const isLoggedOut =
                lastDisconnect?.error instanceof Boom &&
                lastDisconnect.error.output.statusCode === DisconnectReason.loggedOut;

            if (isLoggedOut) {
                // Loggedout
                console.log("User logged out from BOT server❌");

                // Delete auth_info folder
                const folderPath = path.join(__dirname, "..", "auth_info");

                fs.rm(folderPath, { recursive: true, force: true }, (err) => {
                    if (err) {
                        console.error("Failed to delete auth_info folder:", err);
                    } else {
                        console.log("auth_info folder deleted successfully✅");
                    }
                });
            } else {
                // Reconnecting
                console.log("Connection closed❌...Reconnecting...🔄");
                startSocket();
            }
        } else if (connection === "open") {
            console.log("BOT is connected✅");
        } else {
            console.log("BOT is connecting...🔄");
        }
    });

    // New messages
    socket.ev.on("messages.upsert", async ({ messages, type, requestId }) => {
        if (isGroupID && type === "notify" && messages[0].message) {
            const msg = messages[0];
            const senderId = msg.key.remoteJid;
            const phoneNo = senderId?.split("@")[0].slice(2);

            const student = students.find((std) => std.phoneNo === phoneNo);

            if (msg.message?.audioMessage) {
            }

            console.log(
                "PhoneNo:",
                phoneNo,
                "student:",
                student?.name || "Unknown",
                "Message:",
                msg.message
            );
        }
    });
};
