import { Router } from "express";
import { batchRoute } from "./batchRoute";

const router = Router();

// Batch route
router.use('/batch', batchRoute);


export default router;
