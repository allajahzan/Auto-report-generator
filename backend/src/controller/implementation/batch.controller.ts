import { Request, Response, NextFunction } from "express";
import {
    HTTPStatusCode,
    ResponseMessage,
    SendResponse,
} from "@codeflare/common";
import { IBatchController } from "../interface";
import { IBatchService } from "../../service/interface";

// Implementation for Batch Controller
export class BatchController implements IBatchController {
    private batchService: IBatchService;

    constructor(batchService: IBatchService) {
        this.batchService = batchService;
    }

    // Get batch
    async getBatch(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { groupId, coordinatorId } = req.query;

            const data = await this.batchService.getBatch(
                groupId as string,
                coordinatorId as string
            );

            SendResponse(res, HTTPStatusCode.OK, ResponseMessage.SUCCESS, data);
        } catch (err: unknown) {
            next(err);
        }
    }

    // Update batch details
    async updateBatchDetails(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { groupId, coordinatorId } = req.query;
            const data = req.body;

            await this.batchService.updateBatchDetails(
                groupId as string,
                coordinatorId as string,
                data
            );

            SendResponse(res, HTTPStatusCode.OK, ResponseMessage.SUCCESS);
        } catch (err: unknown) {
            next(err);
        }
    }

    // Get participants
    async getParticipants(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { groupId, coordinatorId } = req.query;

            const data = await this.batchService.getParticipants(
                groupId as string,
                coordinatorId as string
            );

            SendResponse(res, HTTPStatusCode.OK, ResponseMessage.SUCCESS, data);
        } catch (err: unknown) {
            next(err);
        }
    }

    // Add partipants
    async addParticipants(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { groupId, coordinatorId } = req.query;
            const participant = req.body;

            await this.batchService.addParticipants(
                groupId as string,
                coordinatorId as string,
                participant
            );

            SendResponse(res, HTTPStatusCode.OK, ResponseMessage.SUCCESS);
        } catch (err: unknown) {
            next(err);
        }
    }

    // Update participants
    async updateParicipants(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { groupId, coordinatorId } = req.query;
            const participant = req.body;

            await this.batchService.updateParicipants(
                groupId as string,
                coordinatorId as string,
                participant
            );

            SendResponse(res, HTTPStatusCode.OK, ResponseMessage.SUCCESS);
        } catch (err: unknown) {
            next(err);
        }
    }

    // Select group
    async selectGroup(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { groupId, coordinatorId } = req.query;
            const data = req.body;

            await this.batchService.selectGroup(
                groupId as string,
                coordinatorId as string,
                data
            );

            SendResponse(res, HTTPStatusCode.OK, ResponseMessage.SUCCESS);
        } catch (err: unknown) {
            next(err);
        }
    }

    // Disconnect
    async disconnect(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const { groupId, coordinatorId } = req.query;

            await this.batchService.disconnect(
                groupId as string,
                coordinatorId as string
            );

            SendResponse(res, HTTPStatusCode.OK, ResponseMessage.SUCCESS);
        } catch (err: unknown) {
            next(err);
        }
    }
}
