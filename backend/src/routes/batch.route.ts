import { Router } from "express";
import { BatchRepository } from "../repository/implementations";
import { BatchService } from "../service/implementations";
import { BatchController } from "../controller/implementations";
import { Batch } from "../models";
import { checkBatch } from "../middlewares";

const router = Router();

// Dependency Injuction
const batchRepository = new BatchRepository(Batch);
const batchService = new BatchService(batchRepository);
const batchController = new BatchController(batchService);

// Get batch
router.get("/", async (req, res, next) => {
    batchController.getBatch(req, res, next);
});

// Update batch details
router.patch("/", checkBatch, async (req, res, next) => {
    batchController.updateBatchDetails(req, res, next);
});

// Get participants
router.get("/participant", async (req, res, next) => {
    batchController.getParticipants(req, res, next);
});

// Add participants
router.post("/participant", checkBatch, async (req, res, next) => {
    batchController.addParticipants(req, res, next);
});

// Update particiapants details
router.patch("/participant", checkBatch, async (req, res, next) => {
    batchController.updateParicipants(req, res, next);
});

// Select group
router.post("/group", async (req, res, next) => {
    batchController.selectGroup(req, res, next);
});

// Disconnect
router.delete("/", checkBatch, async (req, res, next) => {
    batchController.disconnect(req, res, next);
});

export { router as batchRoute };
