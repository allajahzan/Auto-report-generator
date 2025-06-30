import { Router } from "express";
import { batchRoute } from "./batchRoute";
import { reportRoute } from "./reportRoute";

const router = Router();

// Batch route
router.use('/batch', batchRoute);

// Report route
router.use('/report', reportRoute);

export default router;
