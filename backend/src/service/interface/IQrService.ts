import { Response } from "express";

/** Interface for QR Service */
export interface IQrService {
    getQRcode(phoneNumber: string): Promise<void | Response>;
}
