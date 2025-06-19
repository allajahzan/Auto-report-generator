import { Router } from "express";
import { QRService } from "../service/implementation/qrService";
import { QRController } from "../controller/implementation/qrController";

const router = Router();

// Dependency Injuction
const qrService = new QRService();
const qrController = new QRController(qrService);

// Get qr code
router.get("/", async (req, res, next) => {
    qrController.getQRcode(req, res, next);
});

export { router as qrRoute };
