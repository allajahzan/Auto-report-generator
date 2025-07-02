import { NotFoundError } from "@codeflare/common";
import { Request, Response, NextFunction } from "express";
import { BatchRepository } from "../repository/implementations";
import { Batch } from "../models";

// Batch repository
const batchRepository = new BatchRepository(Batch);

// Check batch
export const checkBatch = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { groupId, coordinatorId } = req.query;

        const batch = await batchRepository.findOne({
            groupId,
            coordinatorId,
        });

        if (!batch) throw new NotFoundError("This batch not found");

        next();
    } catch (err: unknown) {
        next(err);
    }
};
