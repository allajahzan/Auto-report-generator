import { Router } from "express";
import { batchRoute } from "./batch.route";
import { reportRoute } from "./report.route";

const router = Router();

// Batch route
router.use('/batch', batchRoute);

// Report route
router.use('/report', reportRoute);

export default router;
