import { WASocket } from "@whiskeysockets/baileys";
import schedule from "node-schedule";
import { sendTaskReport } from "../utils/sendReport";

// Schedule task report
export const scheduleTaskReport = async (
    phoneNumber: string,
    sock: WASocket
) => {
    // Scheduled task to send task report at 10:00 PM
    // Cancel any existing job for this phone number first
    const jobName = `task-report-${phoneNumber}`;
    const existingJob = schedule.scheduledJobs[jobName];
    if (existingJob) {
        existingJob.cancel();
        console.log(`Cancelled existing job:${phoneNumber}`);
    }

    schedule.scheduleJob(jobName, "0 22 * * *", async () => {
        try {
            await sendTaskReport(phoneNumber, sock, true);
        } catch (err) {
            console.error("Error in scheduled task:", err);
        }
    });
};
