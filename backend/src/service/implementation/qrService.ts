import { Response } from "express";
import { startSocket } from "../../bot/baileys";
import { IQrService } from "../interface/IQrService";
import fs from "fs";
import path from "path";
import { getIO } from "../../socket/connection";

/** Implementation for QR Service */
export class QRService implements IQrService {
    /**
     * Get QR code
     * @param phone Phone number
     * @returns QR code
     */
    async getQRcode(phoneNumber: string): Promise<void | Response> {
        console.log(phoneNumber);

        try {
            const io = getIO();

            startSocket(
                phoneNumber,
                (qr) => io.emit("get-qrcode", qr),
                (status) => io.emit("bot-status", status)
            );
        } catch (err: unknown) {
            throw err;
        }
    }
}
