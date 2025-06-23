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
import schedule from "node-schedule";
import { ReportRepository } from "../repository/implementation/reportRepository";
import Report from "../model/reportSchema";
import { ObjectId } from "mongoose";
import { report } from "process";

// Batch repository
const batchRepository = new BatchRepository(Batch);

// Report repository
const reportRepository = new ReportRepository(Report);

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
                    } catch (err) {
                        console.error("Failed to delete auth_info", err);
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
                        console.error("Failed to logout:", err);
                    }

                    return;
                }

                console.log("✅ Connected to BOT:", phoneNumber);
                setSocket(phoneNumber, sock);

                emitStatus("connected", "Successfully connected to Report Buddy 👏");

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
                                    profilePic = "";
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

                    console.log("🚪Logged out from BOT:", phoneNumber);

                    setTimeout(() => {
                        try {
                            fs.rmSync(authPath, { recursive: true, force: true });
                        } catch (err) {
                            console.error("Failed to delete auth_info", err);
                        }
                    }, 3000);

                    if (connectedPhone === phoneNumber) {
                        emitStatus(
                            "disconnected",
                            "You have been logged-out from Report Buddy 👎"
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
                        emitStatus("error", "Failed reconnecting to Report Buddy 🤧");
                    }
                }
            }
        });

        // New messages
        sock.ev.on("messages.upsert", async ({ messages, type }) => {
            // Between 15-22PM (3-10PM)
            const time = new Date().getHours();
            // if (time < 15 || time > 22) return;

            // Batch
            const batch = await batchRepository.findOne({
                coordinatorId: phoneNumber,
            });

            if (!batch || !messages || !messages.length) return;

            const groupIdFromDB = batch.groupId;

            for (const msg of messages) {
                // Check if message is from group
                const isMessageFromGroup =
                    type === "notify" && msg.key.remoteJid?.endsWith("@g.us");

                // Check with group ID
                if (isMessageFromGroup && groupIdFromDB === msg.key.remoteJid) {
                    const msgSender = msg.key.participant;
                    const sender = batch.participants.find((p) => p.id === msgSender);

                    if (!sender) return;

                    console.log("sender name:", sender.name, "sender role:", sender.role);

                    // If not student, stop
                    if (sender.role !== "student") return;

                    const textMessage =
                        msg.message?.conversation ||
                        msg.message?.extendedTextMessage?.text ||
                        "";

                    console.log("message: ", textMessage ? textMessage : undefined);

                    // Check if message is text and it is "Audio task"
                    const isTextIsAudioTask = /\baudio\s*task\b/i.test(
                        textMessage.trim()
                    );

                    console.log("Text is 'Audio task':", isTextIsAudioTask);

                    const now = new Date();
                    now.setHours(0, 0, 0, 0);

                    // If message is text and it is "Audio task"
                    if (isTextIsAudioTask && sender) {
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

                            console.log("Created attendence for:", sender.phoneNumber);
                        }
                    }

                    // If message is audio
                    if (msg.message?.audioMessage && sender) {
                        // Check if report of this batch exists for this day
                        let isReportExist = await reportRepository.findOne({
                            batchId: batch._id,
                            date: now,
                        });

                        if (!isReportExist) return;

                        const existingReportOfSender = isReportExist.audioTaskReport.find(
                            (r) => r.phoneNumber === sender.phoneNumber
                        );

                        if (existingReportOfSender && !existingReportOfSender.isCompleted) {
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

                                console.log("Completed attendence for:", sender.phoneNumber);
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
                                            audioTaskReport: { phoneNumber: sender.phoneNumber },
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
                                    console.error("Failed to notify sender for:", phoneNumber);
                                }
                            }
                        }
                    }
                }
            }
        });

        // Scheduled task to send audio task report at 22:05PM (10:05PM)
        schedule.scheduleJob(
            `audio-task-report${phoneNumber + "-" + new Date().getTime()}`,
            "5 22 * * *",
            async () => {
                console.log("Sending audio task report at 22:05PM");

                const batch = await batchRepository.findOne({
                    coordinatorId: phoneNumber,
                });

                if (!batch) return;

                // Participants
                const participants = batch.participants;

                const now = new Date();
                now.setHours(0, 0, 0, 0);

                // Report of this batch for this day
                const isReportExist = await reportRepository.findOne({
                    batchId: batch._id,
                    date: now,
                });

                // If report of this batch exists,
                // get audioTaskReport or else take audioTaskReport as empty array
                const audioTaskReport = isReportExist?.audioTaskReport || [];

                let audio_task_report: Record<string, boolean> = {};

                // Iterate through participants
                for (const p of participants) {
                    if (p.role !== "student") continue;

                    const existingReportOfStudent = audioTaskReport.find(
                        (r) => r.phoneNumber === p.phoneNumber
                    );

                    if (existingReportOfStudent && existingReportOfStudent.isCompleted) {
                        audio_task_report[existingReportOfStudent.name] = true;
                    } else {
                        audio_task_report[p.name || p.phoneNumber] = false;
                    }
                }

                // Other details for report
                const formattedDate = now.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                });
                const coordinator = participants.find(
                    (p) => p.phoneNumber === phoneNumber
                );
                const trainer = participants.find((p) => p.role === "trainer");

                // audio task report => text
                let text = `Audio task report\n🎓BATCH : ${batch.batchName
                    }\n📅Date: ${formattedDate}\n👨‍🏫Trainer : ${trainer?.name || "Unknown"
                    }\n🎤Coordinator: ${coordinator?.name || "Unknown"}\n📝Topic:${batch.audioTaskTopic || "Not mentioned"
                    }\n\nSubmitted:`;

                for (const p in audio_task_report) {
                    if (audio_task_report[p]) text += `\n${p}:✅`;
                }

                text += "\n\nNot submitted:";

                for (const p in audio_task_report) {
                    if (!audio_task_report[p]) text += `\n${p}:❌`;
                }

                // Send text in group
                try {
                    await sock.sendMessage(batch.groupId, { text });
                } catch (err) {
                    console.error(
                        "Failed to send audio task report in group for:",
                        phoneNumber
                    );
                }
            }
        );
    } catch (err) {
        console.error("Error creating socket or during startup:", err);
        emitStatus("error", "Failed connecting to Report Buddy 🤧");
    }
};

// Start socket on server start
export const startSocketOnServerStart = async () => {
    const authDir = "src/auth_info";

    try {
        const existingUsers = fs.readdirSync(authDir);

        for (const phoneNumber of existingUsers) {
            const batch = await batchRepository.findOne({
                coordinatorId: phoneNumber,
            });

            if (!batch || !batch.groupId) return;

            console.log(phoneNumber, "to start socket");

            startSocket(
                phoneNumber,
                () => { },
                () => { }
            );
        }

        // Refresh every 2 minutes
        setInterval(async () => {
            for (const phoneNumber of existingUsers) {
                const batch = await batchRepository.findOne({
                    coordinatorId: phoneNumber,
                });

                if (!batch || !batch.groupId) return;

                console.log(phoneNumber, "to start socket");

                startSocket(
                    phoneNumber,
                    () => { },
                    () => { }
                );
            }
        }, 60 * 1000 * 2);
    } catch (err) {
        console.error("Error in startSocketOnServerStart:", err);
    }
};
