import { NotFoundError } from "@codeflare/common";
import { Request, Response, NextFunction } from "express";
import { BatchRepository } from "../repository/implementation";
import { Batch } from "../model";

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

        if (!batch) throw new NotFoundError("Batch not found");

        next();
    } catch (err: unknown) {
        next(err);
    }
};
