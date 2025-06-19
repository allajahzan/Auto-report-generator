import { Response } from "express";
import { startSocket } from "../../bot/baileys";
import { IQrService } from "../interface/IQrService";
import fs from "fs";
import path from "path";
import { getActiveSockets, getIO } from "../../socket/connection";

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

            startSocket(
                phoneNumber,
                (qr) => {
                    const activeSockets = getActiveSockets();
                    const socket = activeSockets[phoneNumber];

                    if (socket) {
                        io.to(socket).emit("get-qrcode", qr);
                    }
                },
                (status, message) => {
                    const activeSockets = getActiveSockets();
                    const socket = activeSockets[phoneNumber];
                    
                    if (socket) {
                        io.to(socket).emit("bot-status", status, message);
                    }
                }
            );
        } catch (err: unknown) {
            throw err;
        }
    }
}
