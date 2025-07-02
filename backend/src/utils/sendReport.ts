import { WASocket } from "@whiskeysockets/baileys";
import {
    BatchRepository,
    ReportRepository,
} from "../repository/implementations";
import { Batch, Report } from "../models";

// Batch repository
const batchRepository = new BatchRepository(Batch);

// Report repository
const reportRepository = new ReportRepository(Report);

// Send tast report
export const sendTaskReport = async (
    phoneNumber: string,
    sock: WASocket,
    checkSharingEnabled: boolean
) => {
    try {
        const batch = await batchRepository.findOne({
            coordinatorId: phoneNumber,
        });

        if (!batch) return;

        // If sharing is disabled
        if (checkSharingEnabled && !batch.isSharingEnabled) return;

        console.log("Send task report in WhatsApp Group:", phoneNumber);

        // Participants
        const participants = batch.participants;

        // Correct date with proper timezone
        const now = new Date();
        const istDate = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
        const dateStr = istDate.toISOString().split("T")[0]; // "2025-06-28"

        // Report of this batch for this day
        const isReportExist = await reportRepository.findOne({
            batchId: batch._id,
            date: dateStr,
        });

        if (!isReportExist) return;

        // If report of this batch exists,
        const taskReport = isReportExist?.taskReport || [];

        let audio_task_report: Record<string, boolean> = {};

        // Iterate through participants
        for (const p of participants) {
            // If not student, go next
            if (p.role !== "Student") continue;

            const existingReportOfStudent = taskReport.find(
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

        const coordinator = participants.find((p) => p.phoneNumber === phoneNumber);
        const trainer = participants.find((p) => p.role === "Trainer");

        // audio task report => text
        let text = `${isReportExist?.taskType
                ? `${isReportExist.taskType + " " + "task"}`
                : "Dailt task"
            } report\n🎓BATCH: ${batch.batchName
            }\n📅Date: ${formattedDate}\n👨‍🏫Trainer: ${trainer?.name || "Unknown"
            }\n🎤Coordinator: ${coordinator?.name || "Unknown"}\n📝Topic: ${isReportExist?.taskTopic || "Not mentioned"
            }\n\nSubmitted:-`;

        for (const p in audio_task_report) {
            if (audio_task_report[p]) text += `\n${p}:✅`;
        }

        text += "\n\nNot submitted:-";

        for (const p in audio_task_report) {
            if (!audio_task_report[p]) text += `\n${p}:❌`;
        }

        // Send text in group
        try {
            await sock.sendMessage(batch.groupId, { text });
            console.log(
                `Successfully sent ${isReportExist?.taskType} task report ✅:`,
                phoneNumber
            );
        } catch (err) {
            console.error("Error sending audio task report:", phoneNumber);
        }
    } catch (err) {
        console.error("Error in making report:", phoneNumber);
    }
};
