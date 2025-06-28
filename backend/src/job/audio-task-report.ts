import { WASocket } from "@whiskeysockets/baileys";
import Batch from "../model/batchSchema";
import Report from "../model/reportSchema";
import { BatchRepository } from "../repository/implementation/batchRepository";
import { ReportRepository } from "../repository/implementation/reportRepository";
import schedule from "node-schedule";

// Batch repository
const batchRepository = new BatchRepository(Batch);

// Report repository
const reportRepository = new ReportRepository(Report);

// Schedule audio task report
export const scheduleAudioTaskReport = async (
    phoneNumber: string,
    sock: WASocket
) => {
    // Scheduled task to send audio task report at 10:05 PM
    // Cancel any existing job for this phone number first
    const existingJobName = `audio-task-report-${phoneNumber}`;
    const existingJob = schedule.scheduledJobs[existingJobName];
    if (existingJob) {
        existingJob.cancel();
        console.log(`Cancelled existing job:${phoneNumber}`);
    }

    schedule.scheduleJob(existingJobName, "22 11 * * *", async () => {
        try {
            console.log("It's time to send audio task report in WhatsApp Group");

            const batch = await batchRepository.findOne({
                coordinatorId: phoneNumber,
            });

            if (!batch || !batch.isTrackingEnabled || !batch.isSharingEnabled)
                return;

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
                // If not student, go next
                if (p.role !== "Student") continue;

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
            const trainer = participants.find((p) => p.role === "Trainer");

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
                console.log("✅ Successfully sent audio task report:", phoneNumber);
            } catch (err) {
                console.error("Error sending audio task report:", phoneNumber);
            }
        } catch (err) {
            console.error("Error in scheduled task:", err);
        }
    });
};
