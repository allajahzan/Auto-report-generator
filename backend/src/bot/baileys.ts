import makeWASocket, {
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    DisconnectReason,
} from "@whiskeysockets/baileys";
import P from "pino";
import { Boom } from "@hapi/boom";
import fs from "fs";
import { getActiveUsers, getIO } from "../socket/io";
import { removeSocket, setSocket } from "./socket-store";
import { BatchRepository } from "../repository/implementation/batchRepository";
import Batch from "../model/batchSchema";
import { ReportRepository } from "../repository/implementation/reportRepository";
import Report from "../model/reportSchema";
import { ObjectId } from "mongoose";
import { scheduleAudioTaskReport } from "../job/audio-task-report";

// Batch repository
const batchRepository = new BatchRepository(Batch);

// Report repository
const reportRepository = new ReportRepository(Report);

// Unhandled rejection
process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Start baileys socket
export const startSocket = async (
    phoneNumber: string,
    emitQR: (qr: string) => void,
    emitStatus: (
        status: "connected" | "disconnected" | "expired" | "error",
        message: string,
        groupId?: string
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
            try {
                await saveCreds();
            } catch (err) {
                console.error("Error saving credentials:", phoneNumber);
            }
        });

        const io = getIO();
        let currentQR: string | null = null;
        let ATTEMPT = 5;
        let RETRIES = 0;

        let connectedId;

        // Connection
        sock.ev.on("connection.update", async (update) => {
            try {
                const { connection, lastDisconnect, qr } = update;

                if (qr) {
                    if (currentQR && currentQR !== qr) {
                        console.log("⏰ Previous QR expired:", phoneNumber);
                        emitStatus(
                            "expired",
                            "QR code is expired, now get started again 🚀"
                        );
                        currentQR = null;

                        try {
                            fs.rmSync(authPath, { recursive: true, force: true });
                        } catch (err) {
                            console.error("Error deleting auth_info:", phoneNumber);
                        }

                        sock.ws.close();
                        return;
                    }

                    currentQR = qr;
                    console.log("📸 QR is generated:", phoneNumber);
                    emitQR(qr);
                }

                connectedId = sock.user?.id;

                // Open connection
                if (connection === "open") {
                    currentQR = null; // Make current QR null
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
                            console.error("Failed to logout:", err);
                        }

                        return;
                    }

                    console.log("✅ Connected to BOT:", phoneNumber);
                    setSocket(phoneNumber, sock);

                    // Check weather group already selected or not
                    const batch = await batchRepository.findOne({
                        coordinatorId: phoneNumber,
                    });

                    if (batch && batch.groupId) {
                        emitStatus(
                            "connected",
                            "Successfully connected to Report Buddy 👏",
                            batch.groupId
                        );

                        return;
                    }

                    emitStatus("connected", "Successfully connected to Report Buddy 👏");

                    // Fetch groups
                    try {
                        const groups = await sock.groupFetchAllParticipating();

                        const groupList = await Promise.allSettled(
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
                                        profilePic = "";
                                    }

                                    return {
                                        id: group.id,
                                        name: group.subject,
                                        profilePic,
                                    };
                                })
                        );

                        // Filter successful results
                        const successfulGroups = groupList
                            .filter((result) => result.status === "fulfilled")
                            .map((result) => (result as PromiseFulfilledResult<any>).value);

                        console.log("📃 Fetched WhatsApp groups:", phoneNumber);

                        const socketId = getActiveUsers(phoneNumber);
                        if (socketId) {
                            io.to(socketId).emit("group-list", successfulGroups);
                        }
                    } catch (err) {
                        console.error("Error fetching WhatsApp groups:", phoneNumber);
                    }
                }

                // Closed connection
                if (connection === "close") {
                    currentQR = null; // Make current QR null
                    removeSocket(phoneNumber);

                    const reason = (lastDisconnect?.error as Boom)?.output?.statusCode;

                    // Timeout
                    if (reason === DisconnectReason.timedOut) {
                        emitStatus("error", "Request timed out. Try again later ⏱️");
                    }

                    // Closed
                    if (reason === DisconnectReason.connectionClosed) {
                        console.log("Connection closed:", phoneNumber);
                    }

                    // Logged-out
                    if (reason === DisconnectReason.loggedOut) {
                        const connectedPhone = connectedId?.split(":")[0].slice(2);

                        // Remove coordinatorId
                        await batchRepository.update(
                            { coordinatorId: phoneNumber },
                            { $unset: { coordinatorId: 1 } }
                        );

                        console.log("🚪Logged out from BOT:", phoneNumber);

                        setTimeout(() => {
                            try {
                                fs.rmSync(authPath, { recursive: true, force: true });
                            } catch (err) {
                                console.error("Error deleting auth_info:", phoneNumber);
                            }
                        }, 3000);

                        if (connectedPhone === phoneNumber) {
                            emitStatus(
                                "disconnected",
                                "You have been logged out of Report Buddy 👋"
                            );
                        }
                    }

                    // Restart
                    if (reason === DisconnectReason.restartRequired) {
                        if (ATTEMPT > RETRIES) {
                            console.log("🔃 Reconnecting BOT:", phoneNumber);

                            setTimeout(() => {
                                startSocket(phoneNumber, emitQR, emitStatus).catch((err) => {
                                    console.error("Error during reconnection:", phoneNumber);
                                });
                            }, 3000);

                            RETRIES++;
                        } else {
                            // Retries limit reached
                            console.log("⌛ Retries limit reached:", phoneNumber);
                            emitStatus("error", "Failed reconnecting to Report Buddy 🤧");
                        }
                    }
                }
            } catch (err) {
                console.error("Error in connection.update handler:", phoneNumber);
                emitStatus("error", "Connection error occurred");
            }
        });

        // New messages
        sock.ev.on("messages.upsert", async ({ messages, type }) => {
            try {
                // Between 15-22PM (3-10PM)
                const time = new Date().getHours();
                // if (time < 15 || time > 22) return;

                // Batch
                const batch = await batchRepository.findOne({
                    coordinatorId: phoneNumber,
                });

                if (!batch || !batch.isTrackingEnabled || !messages || !messages.length)
                    return;

                const groupIdFromDB = batch.groupId;

                for (const msg of messages) {
                    try {
                        // Check weather message is from group
                        const isMessageFromGroup =
                            type === "notify" && msg.key.remoteJid?.endsWith("@g.us");

                        // Check with group ID
                        if (isMessageFromGroup && groupIdFromDB === msg.key.remoteJid) {
                            const msgSenderId = msg.key.participant;
                            const sender = batch.participants.find(
                                (p) => p.id === msgSenderId
                            );

                            if (!sender) return;

                            console.log(
                                "sender name:",
                                sender.name,
                                "sender role:",
                                sender.role
                            );

                            // If not student, go next
                            if (sender.role !== "Student") continue;

                            const textMessage =
                                msg.message?.conversation ||
                                msg.message?.extendedTextMessage?.text ||
                                "";

                            console.log("message:", textMessage ? textMessage : undefined);

                            // Check weather message is text and also it is "Audio task"
                            const isTextIsAudioTask = /\baudio\s*task\b/i.test(
                                textMessage.trim()
                            );

                            console.log("Text is 'Audio task':", isTextIsAudioTask);

                            const now = new Date();
                            now.setHours(0, 0, 0, 0);

                            // If message is text and it is "Audio task"
                            if (isTextIsAudioTask && sender) {
                                try {
                                    // Check if report of this batch exists for this day
                                    let isReportExist = await reportRepository.findOne({
                                        batchId: batch._id,
                                        date: now,
                                    });

                                    if (!isReportExist) {
                                        isReportExist = await reportRepository.create({
                                            batchId: batch._id as unknown as ObjectId,
                                            date: now,
                                        });
                                    }

                                    if (!isReportExist) return;

                                    const existingReportOfSenderIndex =
                                        isReportExist.audioTaskReport.findIndex(
                                            (r) => r.phoneNumber === sender.phoneNumber
                                        );

                                    // Not exist, then add new report for sender
                                    if (existingReportOfSenderIndex === -1) {
                                        await reportRepository.update(
                                            { batchId: batch._id },
                                            {
                                                $push: {
                                                    audioTaskReport: {
                                                        id: sender.id,
                                                        name: sender.name || sender.phoneNumber,
                                                        phoneNumber: sender.phoneNumber,
                                                        isCompleted: false,
                                                        timestamp: new Date(),
                                                    },
                                                },
                                            }
                                        );

                                        console.log("Created attendence for sender:", phoneNumber);
                                    } else {
                                        console.log(
                                            "Already created attendence for sender:",
                                            phoneNumber
                                        );
                                    }
                                } catch (err) {
                                    console.error(
                                        "Error processing audio task with text message:",
                                        phoneNumber
                                    );
                                }
                            }

                            // If message is audio
                            if (msg.message?.audioMessage && sender) {
                                try {
                                    // Check if report of this batch exists for this day
                                    let isReportExist = await reportRepository.findOne({
                                        batchId: batch._id,
                                        date: now,
                                    });

                                    if (!isReportExist) return;

                                    const existingReportOfSender =
                                        isReportExist.audioTaskReport.find(
                                            (r) => r.phoneNumber === sender.phoneNumber
                                        );

                                    if (
                                        existingReportOfSender &&
                                        !existingReportOfSender.isCompleted
                                    ) {
                                        // Time difference
                                        const timeDiff =
                                            new Date().getTime() -
                                            new Date(existingReportOfSender.timestamp).getTime();

                                        // Within 2 minutes
                                        if (timeDiff <= 2 * 60 * 1000) {
                                            await reportRepository.update(
                                                {
                                                    batchId: batch._id,
                                                    "audioTaskReport.phoneNumber": sender.phoneNumber,
                                                },
                                                { $set: { "audioTaskReport.$.isCompleted": true } }
                                            );

                                            console.log(
                                                "Completed attendence for sender:",
                                                phoneNumber
                                            );
                                        } else {
                                            // Delete the report of sender if time is over
                                            console.log("Time is over for :", sender.phoneNumber);

                                            await reportRepository.update(
                                                {
                                                    batchId: batch._id,
                                                    "audioTaskReport.phoneNumber": sender.phoneNumber,
                                                },
                                                {
                                                    $pull: {
                                                        audioTaskReport: {
                                                            phoneNumber: sender.phoneNumber,
                                                        },
                                                    },
                                                }
                                            );

                                            // Notify the sender
                                            try {
                                                await sock.sendMessage(sender.id, {
                                                    text: `Dear ${sender.name || "Participant"
                                                        },\nYour audio task attendance has been removed as it wasn't submitted within 2 minutes of initiation. Please try again within the time limit to avoid being marked absent.\n\n– Coordinator`,
                                                });
                                            } catch (err) {
                                                console.error(
                                                    "Error sending warning message to sender:",
                                                    phoneNumber
                                                );
                                            }
                                        }
                                    }
                                } catch (err) {
                                    console.error(
                                        "Error processing audio task with audio message:",
                                        phoneNumber
                                    );
                                }
                            }
                        }
                    } catch (err) {
                        console.error("Error processing individual message:", phoneNumber);
                    }
                }
            } catch (err) {
                console.error("Error in messages.upsert handler:", phoneNumber);
            }
        });

        // Schedule audio task report
        scheduleAudioTaskReport(phoneNumber, sock);
    } catch (err) {
        console.error("Error creating socket or during startup:", phoneNumber);
        emitStatus("error", "Failed connecting to Report Buddy 🤧");
        throw err;
    }
};

// Start socket on server start
export const startSocketOnServerStart = async () => {
    const auth_info_dir = "src/auth_info";

    try {
        // Check if auth_info directory exists
        if (!fs.existsSync(auth_info_dir)) {
            console.log("auth_info directory doesn't exist, creating it...");
            fs.mkdirSync(auth_info_dir, { recursive: true });
            return;
        }

        const existingUsers = fs.readdirSync(auth_info_dir);

        if (existingUsers.length === 0) {
            console.log("No connected users found!");
            return;
        }

        // Start sockets for existing users
        const socketPromises = existingUsers.map(async (phoneNumber) => {
            try {
                const batch = await batchRepository.findOne({
                    coordinatorId: phoneNumber,
                });

                if (!batch || !batch.groupId) return;

                console.log("starting BOT:", phoneNumber);

                await startSocket(
                    phoneNumber,
                    () => { },
                    (status, message) => { }
                );
            } catch (err) {
                console.error(`Failed to start BOT:${phoneNumber}`);
            }
        });

        // Wait for all startSocket to complete (success or fail)
        await Promise.allSettled(socketPromises);

        // Refresh every 30 minutes
        setInterval(async () => {
            const refreshPromises = existingUsers.map(async (phoneNumber) => {
                try {
                    const batch = await batchRepository.findOne({
                        coordinatorId: phoneNumber,
                    });

                    if (!batch || !batch.groupId) return;

                    console.log("refreshing BOT:", phoneNumber);

                    await startSocket(
                        phoneNumber,
                        () => { },
                        () => { }
                    );
                } catch (err) {
                    console.error(`Failed to refresh BOT:${phoneNumber}`);
                }
            });

            await Promise.allSettled(refreshPromises);
        }, 5 * 60 * 1000);
    } catch (err) {
        console.error("Error in startSocketOnServerStart:", err);
    }
};
