import { Router } from "express";
import { BatchService } from "../service/implementation/batchService";
import { BatchController } from "../controller/implementation/batchController";
import { BatchRepository } from "../repository/implementation/batchRepository";
import Batch from "../model/batchSchema";

const router = Router();

// Dependency Injuction
const batchRepository = new BatchRepository(Batch);
const batchService = new BatchService(batchRepository);
const qrController = new BatchController(batchService);

// Get batch
router.get("/", async (req, res, next) => {
    qrController.getBatch(req, res, next);
});

export { router as batchRoute };
