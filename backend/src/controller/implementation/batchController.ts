import { Request, Response, NextFunction } from "express";
import { IBatchService } from "../../service/interface/IBatchService";
import { IBatchController } from "../interface/IBatchController";
import {
    HTTPStatusCode,
    ResponseMessage,
    SendResponse,
} from "@codeflare/common";

// Implementation for Batch Controller
export class BatchController implements IBatchController {
    private batchService: IBatchService;

    constructor(batchService: IBatchService) {
        this.batchService = batchService;
    }

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
}
