import makeWASocket, {
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    DisconnectReason,
} from "@whiskeysockets/baileys";
import P from "pino";
import { Boom } from "@hapi/boom";
import fs from "fs";
import {
    BatchRepository,
    ReportRepository,
} from "../repository/implementation";
import { Batch, Report } from "../model";
import { getActiveUsers, getIO } from "../socket";
import { detectIsTopic, detectTaskType } from "../utils";
import { scheduleTaskReport } from "../job";
import { removeSocket, setSocket } from ".";
import { withTimeout } from "../utils/timeout";

// Batch repository
const batchRepository = new BatchRepository(Batch);

// Report repository
const reportRepository = new ReportRepository(Report);

// Unhandled rejection
process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Start baileys socket - For single user
export const startBaileysSocket = async (
    phoneNumber: string,
    emitQR: (qr: string) => void,
    emitStatus: (
        status: "connected" | "disconnected" | "expired" | "error",
        message: string,
        groupId?: string
    ) => void
) => {
    try {
        // auth session
        const authPath = `src/auth/${phoneNumber}`;
        const { state, saveCreds } = await useMultiFileAuthState(authPath);

        const sock = makeWASocket({
            auth: state,
            version: (await fetchLatestBaileysVersion()).version,
            logger: P({ level: "silent" }),
            syncFullHistory: false,
            shouldSyncHistoryMessage: () => false,
        });

        // Save auth
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
                            console.error("Error deleting auth:", phoneNumber);
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
                                        profilePic = await withTimeout(
                                            sock.profilePictureUrl(group.id, "image"),
                                            500,
                                            ""
                                        );
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
                                console.error("Error deleting auth:", phoneNumber);
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
                                startBaileysSocket(phoneNumber, emitQR, emitStatus).catch(
                                    (err) => {
                                        console.error("Error during reconnection:", phoneNumber);
                                    }
                                );
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
                // Batch
                const batch = await batchRepository.findOne({
                    coordinatorId: phoneNumber,
                });

                if (!batch || !messages || !messages.length) return;

                // Group ID of batch
                const groupIdFromDB = batch.groupId;
                const coordinator = batch.participants.find(
                    (p) => p.phoneNumber === phoneNumber
                );

                for (const msg of messages) {
                    try {
                        // Text message
                        const textMessage =
                            msg.message?.conversation ||
                            msg.message?.extendedTextMessage?.text ||
                            "";

                        // Correct date with proper timezone
                        const now = new Date();
                        const istDate = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
                        const dateStr = istDate.toISOString().split("T")[0]; // "2025-06-28"

                        // Check weather it's a self message
                        const isSelfMessage =
                            msg.key.fromMe &&
                            msg.key.remoteJid ===
                            sock.user?.id.split(":")[0] + "@s.whatsapp.net";

                        if (isSelfMessage) {
                            const taskType = detectTaskType(textMessage);
                            const taskTopic = detectIsTopic(textMessage);

                            if (taskType || taskTopic) {
                                console.log("Task Type:", taskType);
                                console.log("Task Topic:", taskTopic);

                                const updatedReport = await reportRepository.findOneAndUpdate(
                                    { batchId: batch._id as unknown as string, date: dateStr },
                                    {
                                        $set: taskTopic
                                            ? { taskTopic: textMessage.split(/topic:/i)[1].trim() }
                                            : { taskType },
                                    },
                                    { upsert: true, new: true }
                                );

                                if (!updatedReport) {
                                    try {
                                        await sock.sendMessage(
                                            msg.key.remoteJid as string,
                                            {
                                                text: `Sorry, we couldn’t update the ${taskTopic ? "topic" : "task"
                                                    } for the day ${new Date(
                                                        dateStr
                                                    ).toLocaleDateString()} ❌.\n\nPlease try again in a few moments or update it directly through the Report Buddy web app.\n\n-Report Buddy`,
                                            },

                                            { quoted: msg }
                                        );
                                    } catch (err) {
                                        console.error(
                                            "Error notifying the coordinator:",
                                            phoneNumber
                                        );
                                    }
                                } else {
                                    try {
                                        await sock.sendMessage(
                                            msg.key.remoteJid as string,
                                            {
                                                text: `${taskTopic ? "Topic" : "Task"
                                                    } has been successfully updated for ${new Date(
                                                        dateStr
                                                    ).toLocaleDateString("en-GB")} ✅.\n\n-Report Buddy`,
                                            },
                                            { quoted: msg }
                                        );
                                    } catch (err) {
                                        console.error(
                                            "Error notifying the coordinator:",
                                            phoneNumber
                                        );
                                    }
                                }
                            }

                            continue;
                        }

                        // Between 15-22PM (3-10PM)
                        const hour = new Date().getHours();
                        if (hour < 15 || hour > 21) return;

                        // Check weather message is from that perticular group or not
                        const isMessageFromGroup =
                            type === "notify" && msg.key.remoteJid?.endsWith("@g.us");
                        const groupId = msg.key.remoteJid;
                        const msgSenderId = msg.key.participant;

                        if (
                            !isMessageFromGroup ||
                            groupIdFromDB !== groupId ||
                            !msgSenderId
                        )
                            continue;

                        // Get sender
                        const sender = batch.participants.find((p) => p.id === msgSenderId);
                        if (!sender) continue;

                        console.log("sender:", { name: sender.name, role: sender.role });
                        console.log("message:", textMessage ? textMessage : undefined);

                        // Check weather message is text and also it is "Start"
                        const isTaskStarted = /\bstart\b/i.test(textMessage.trim());
                        console.log("Task Started:", isTaskStarted);

                        // Check weather tracking is enabled or not -
                        // - When task is started
                        if (isTaskStarted && !batch.isTrackingEnabled) {
                            try {
                                await sock.sendMessage(
                                    coordinator?.id as string,
                                    {
                                        text: "Dear coordinator, Tracking is not enabled for this WhatsApp Group. Please enable it in settings.\n\n-Report Buddy",
                                    },
                                    { quoted: msg }
                                );
                            } catch (err) {
                                console.log("Error in notifying coordinator: ", phoneNumber);
                            }

                            continue;
                        }

                        // Existing report
                        let isReportExist = await reportRepository.findOne({
                            batchId: batch._id as unknown as string,
                            date: dateStr,
                        });

                        if (!isReportExist) {
                            if (!isTaskStarted) continue;

                            try {
                                // Reaction to sender
                                await sock.sendMessage(groupId as string, {
                                    react: {
                                        key: msg.key,
                                        text: "❌",
                                    },
                                });

                                // Notify coordinator
                                await sock.sendMessage(
                                    coordinator?.id as string,
                                    {
                                        text: `Dear coordinator, you haven't added today's task or topic yet 👊\n\n-Report Buddy`,
                                    },
                                    { quoted: msg }
                                );

                                console.log(
                                    "Failed to initialize attendence for sender:",
                                    phoneNumber
                                );
                            } catch (err) {
                                console.error("Error reacting to sender:", phoneNumber);
                            }

                            continue;
                        }

                        // Now initialize attendence for sender
                        if (isTaskStarted) {
                            try {
                                // Existing report of sender
                                const existingReportOfSenderIndex =
                                    isReportExist.taskReport.findIndex(
                                        (r) => r.phoneNumber === sender.phoneNumber
                                    );

                                // Not exist, then add new report for sender
                                let updatedReport;
                                if (existingReportOfSenderIndex === -1) {
                                    updatedReport = await reportRepository.findOneAndUpdate(
                                        { batchId: batch._id as unknown as string, date: dateStr },
                                        {
                                            $push: {
                                                taskReport: {
                                                    id: sender.id,
                                                    name: sender.name || sender.phoneNumber,
                                                    phoneNumber: sender.phoneNumber,
                                                    isCompleted: false,
                                                    timestamp: now,
                                                },
                                            },
                                        },
                                        { new: true }
                                    );

                                    console.log(
                                        "Initialized attendence for sender:",
                                        phoneNumber
                                    );
                                } else {
                                    if (
                                        isReportExist.taskReport[existingReportOfSenderIndex]
                                            .isCompleted
                                    ) {
                                        console.log(
                                            "Attendence already marked for sender:",
                                            phoneNumber
                                        );
                                        continue;
                                    } else {
                                        console.log(
                                            "Already initialized attendence for sender:",
                                            phoneNumber
                                        );
                                    }
                                }

                                // Reaction to sender
                                const reaction =
                                    isReportExist.taskType === "Audio"
                                        ? "🎙️"
                                        : isReportExist.taskType === "Writing"
                                            ? "✍️"
                                            : isReportExist.taskType === "Writing"
                                                ? "👂"
                                                : "";
                                try {
                                    await sock.sendMessage(groupId, {
                                        react: {
                                            key: msg.key,
                                            text:
                                                existingReportOfSenderIndex === -1 && !updatedReport
                                                    ? "❌"
                                                    : reaction,
                                        },
                                    });
                                } catch (err) {
                                    console.error("Error reacting to sender:", phoneNumber);
                                }
                            } catch (err) {
                                console.error(
                                    `Error initializing ${isReportExist.taskType} task:`,
                                    phoneNumber
                                );
                            }

                            continue;
                        }

                        // If task is audio, check message is audio
                        // If task is Writing or listening, check message is image
                        if (
                            (msg.message?.audioMessage &&
                                isReportExist.taskType === "Audio") ||
                            (msg.message?.imageMessage &&
                                (isReportExist.taskType === "Writing" ||
                                    isReportExist.taskType === "Listening"))
                        ) {
                            try {
                                // Existing report of sender
                                const existingReportOfSender = isReportExist.taskReport.find(
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

                                    // Within 10 minutes
                                    if (timeDiff <= 10 * 60 * 1000) {
                                        let updatedReport = await reportRepository.findOneAndUpdate(
                                            {
                                                batchId: batch._id,
                                                date: dateStr,
                                                "taskReport.phoneNumber": sender.phoneNumber,
                                            },
                                            {
                                                $set: {
                                                    "taskReport.$.isCompleted": true,
                                                    "taskReport.$.messageID": msg.key.id,
                                                },
                                            },
                                            { new: true }
                                        );

                                        // Reaction to sender
                                        try {
                                            await sock.sendMessage(groupId, {
                                                react: {
                                                    key: msg.key,
                                                    text: updatedReport ? "✅" : "❌",
                                                },
                                            });
                                        } catch (err) {
                                            console.error("Error reacting to sender:", phoneNumber);
                                        }

                                        console.log("Marked attendence for sender:", phoneNumber);
                                    } else {
                                        console.log("Time is over:", phoneNumber);

                                        // Reset timestamp of the initialized attendence of sender
                                        const updatedReport =
                                            await reportRepository.findOneAndUpdate(
                                                {
                                                    batchId: batch._id,
                                                    date: dateStr,
                                                    "taskReport.phoneNumber": sender.phoneNumber,
                                                },
                                                {
                                                    $set: { "taskReport.$.timestamp": now },
                                                },
                                                { new: true }
                                            );

                                        // React to sender
                                        try {
                                            await sock.sendMessage(groupId, {
                                                react: {
                                                    key: msg.key,
                                                    text: updatedReport ? "🚫" : "❌",
                                                },
                                            });
                                        } catch (err) {
                                            console.error("Error reacting to sender", phoneNumber);
                                        }

                                        // Notify the sender
                                        try {
                                            await sock.sendMessage(sender.id, {
                                                text: `Dear ${sender.name || "student"
                                                    },\nYour ${isReportExist.taskType.toLowerCase()} submission was removed as it wasn't sent within the time limit. Please resend it within the next 10 minutes to avoid being marked absent ⏱️.\n\n-Report Buddy`,
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
                                    `Error processing ${isReportExist.taskType} task:`,
                                    phoneNumber
                                );
                            }
                        }
                    } catch (err) {
                        console.error("Error processing individual message:", err);
                    }
                }
            } catch (err) {
                console.error("Error in messages.upsert handler:", phoneNumber);
            }
        });

        // Updates in messages
        sock.ev.on("messages.update", async (updates) => {
            try {
                // Batch
                const batch = await batchRepository.findOne({
                    coordinatorId: phoneNumber,
                });

                if (!batch) return;

                // Group ID
                const groupIdFromDB = batch.groupId;

                for (const update of updates) {
                    try {
                        // Message deleted
                        if (update.update.messageStubType === 1) {
                            console.log("Message deleted");

                            const messageId = update.key.id;

                            const isMessageFromGroup =
                                update.key.remoteJid?.endsWith("@g.us");
                            const groupId = update.key.remoteJid;
                            const msgSenderId = update.key.participant;

                            if (
                                !isMessageFromGroup ||
                                groupIdFromDB !== groupId ||
                                !msgSenderId
                            )
                                continue;

                            console.log("From our group");

                            // Correct date with proper timezone
                            const now = new Date();
                            const istDate = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
                            const dateStr = istDate.toISOString().split("T")[0]; // "2025-06-28"

                            const isReportExist = await reportRepository.findOneAndUpdate(
                                {
                                    batchId: batch._id as unknown as string,
                                    date: dateStr,
                                    "taskReport.messageID": messageId,
                                },
                                {
                                    $set: {
                                        "taskReport.$.isCompleted": false,
                                        "taskReport.$.timestamp": now,
                                    },
                                },
                                { new: true }
                            );

                            if (!isReportExist) continue;

                            // Sender, who deleted the message
                            const sender = batch.participants.find(
                                (p) => p.id === msgSenderId
                            );

                            if (!sender) continue;

                            try {
                                await sock.sendMessage(msgSenderId as string, {
                                    text: `Dear ${sender?.name || "student"
                                        },\n\nWe noticed that you deleted your submitted task in the group. As a result, your attendance for this task has been marked as absent. So please resend the task within the next 10 minutes ⏱️.\n\n-Report Buddy`,
                                });
                            } catch (err) {
                                console.error(
                                    "Error notifying sender for deleting task:",
                                    phoneNumber
                                );
                            }

                            console.log(
                                "Reset attendence of sender after deleting task:",
                                phoneNumber
                            );
                        }
                    } catch (err) {
                        console.error(
                            "Error processing individual message updates:",
                            phoneNumber
                        );
                    }
                }
            } catch (err) {
                console.error("Error in messages.update handler:", phoneNumber);
            }
        });

        // Schedule task report sharing
        scheduleTaskReport(phoneNumber, sock);
    } catch (err) {
        console.error("Error creating socket or during startup:", phoneNumber);
        emitStatus("error", "Failed connecting to Report Buddy 🤧");
        throw err;
    }
};

// Start baileys sockets - For existing multiple users
export const startBaileysSockets = async () => {
    const auth_info_dir = "src/auth";

    try {
        // Check if auth directory exists
        if (!fs.existsSync(auth_info_dir)) {
            console.log("auth directory doesn't exist, creating it...");
            fs.mkdirSync(auth_info_dir, { recursive: true });
            return;
        }

        const existingUsers = fs.readdirSync(auth_info_dir);

        if (existingUsers.length === 0) {
            console.log("No connected users found!");
            return;
        }

        // Start sockets
        const socketPromises = existingUsers.map(async (phoneNumber) => {
            try {
                const batch = await batchRepository.findOne({
                    coordinatorId: phoneNumber,
                });

                if (!batch || !batch.groupId) return;

                console.log("starting BOT:", phoneNumber);

                await startBaileysSocket(
                    phoneNumber,
                    () => { },
                    (status, message) => { }
                );
            } catch (err) {
                console.error(`Failed to start BOT:${phoneNumber}`);
            }
        });

        // Wait for all startBaileysSocket to complete (success or fail)
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

                    await startBaileysSocket(
                        phoneNumber,
                        () => { },
                        () => { }
                    );
                } catch (err) {
                    console.error(`Failed to refresh BOT:${phoneNumber}`);
                }
            });

            await Promise.allSettled(refreshPromises);
        }, 2 * 60 * 1000);
    } catch (err) {
        console.error("Error in startSocketOnServerStart:", err);
    }
};
