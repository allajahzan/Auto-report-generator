import { Response } from "express";
import { startSocket } from "../../bot/baileys";
import { IQrService } from "../interface/IQrService";
import fs from "fs";
import path from "path";
import { getActiveSockets, getIO } from "../../socket/bot";

/** Implementation for QR Service */
export class QRService implements IQrService {
    /**
     * Get QR code
     * @param phone Phone number
     * @returns QR code
     */
    async getQRcode(phoneNumber: string): Promise<void | Response> {
        try {
            const io = getIO();

            
        } catch (err: unknown) {
            throw err;
        }
    }
}
