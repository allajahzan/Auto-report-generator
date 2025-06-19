import { Request, Response, NextFunction } from "express";
import { IQrService } from "../../service/interface/IQrService";
import { IQRController } from "../interface/IQrController";
import {
    HTTPStatusCode,
    ResponseMessage,
    SendResponse,
} from "@codeflare/common";

/** Implementation for QR Controller */
export class QRController implements IQRController {
    private qrService: IQrService;

    /**
     * Constructs a new QRController.
     * @param qrService - An instance of IQrService to handle QR code logic.
     */

    constructor(qrService: IQrService) {
        this.qrService = qrService;
    }

    /**
     * Handles GET /get-qr-code, generates a QR code based on student's phone number.
     * @param req - The express request object.
     * @param res - The express response object.
     * @param next - The express next middleware function.
     */
    async getQRcode(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { phoneNumber } = req.query;

            await this.qrService.getQRcode(phoneNumber as string);
            
            SendResponse(res, HTTPStatusCode.OK, ResponseMessage.SUCCESS);
        } catch (err: unknown) {
            next(err);
        }
    }
}
