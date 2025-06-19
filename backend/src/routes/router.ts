import { Router } from "express";
import { qrRoute } from "./qrRoute";

const router = Router();

router.use('/qr-code', qrRoute);

export default router;
