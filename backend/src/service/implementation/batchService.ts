import { IBatchService } from "../interface/IBatchService";
import { IBatchRepository } from "../../repository/interface/IBatchRepository";
import {
    BadRequestError,
    ForbiddenError,
    NotFoundError,
    UnauthorizedError,
} from "@codeflare/common";
import { getSocket } from "../../bot/socket-store";
import { IBatchDto } from "../../dto/batchDto";
import fs from "fs";
import { IBatchSchema } from "../../entities/IBatchSchema";

// Implementation for Batch Service
export class BatchService implements IBatchService {
    private batchRepository: IBatchRepository;

    constructor(batchRepository: IBatchRepository) {
        this.batchRepository = batchRepository;
    }

    // Get batch
    async getBatch(groupId: string, coordinatorId: string): Promise<IBatchDto> {
        try {
            const batch = await this.batchRepository.findOne({
                groupId,
                coordinatorId,
            });

            if (!batch) throw new NotFoundError("Batch not found");

            const phoneNumber = coordinatorId;

            // Check if auth_info directory exists or empty
            const auth_info_dir = `src/auth_info/${phoneNumber}`;

            if (
                !fs.existsSync(auth_info_dir) ||
                fs.readdirSync(auth_info_dir).length === 0
            ) {
                throw new UnauthorizedError("Session not found");
            }

            const sock = getSocket(phoneNumber);

            if (!sock) {
                throw new ForbiddenError();
            }

            // Map data to return type
            const batchDto: IBatchDto = {
                coordinatorId,
                groupId,
                batchName: batch.batchName,
                participants: await Promise.all(
                    batch.participants.map(async (p) => {
                        let profilePic = "";
                        try {
                            profilePic = (await sock.profilePictureUrl(p.id, "image")) || "";
                        } catch (err) {
                            profilePic = "";
                        }

                        return {
                            id: p.id,
                            name: p.name,
                            phoneNumber: p.phoneNumber,
                            profilePic: profilePic,
                            role: p.role
                        };
                    })
                ),
                createdAt: batch.createdAt,
            };

            return batchDto;
        } catch (err: unknown) {
            throw err;
        }
    }

    // Update batch details
    async updateBatchDetails(
        groupId: string,
        coordinatorId: string,
        data: Partial<IBatchSchema>
    ): Promise<void> {
        try {
            const batch = await this.batchRepository.findOne({
                groupId,
                coordinatorId,
            });

            if (!batch) throw new NotFoundError("Batch not found");

            const updatedBatch = await this.batchRepository.update(
                { coordinatorId, groupId },
                { $set: data }
            );

            if (!updatedBatch)
                throw new BadRequestError("Failed to update batch name");
        } catch (err: unknown) {
            throw err;
        }
    }

    // Update particiapants
    async updateParicipants(
        groupId: string,
        coordinatorId: string,
        participant: {
            id: string;
            name: string;
            phoneNumber: string;
            role: string;
        }
    ): Promise<void> {
        try {
            const batch = await this.batchRepository.findOne({
                groupId,
                coordinatorId,
            });

            if (!batch) throw new NotFoundError("Batch not found");

            const updatedBatch = await this.batchRepository.update(
                {
                    coordinatorId,
                    groupId,
                    "participants.id": participant.id,
                },
                {
                    $set: {
                        "participants.$.name": participant.name,
                        "participants.$.phoneNumber": participant.phoneNumber,
                        "participants.$.role": participant.role,
                    },
                },
                {
                    new: true,
                }
            );

            if (!updatedBatch)
                throw new BadRequestError("Failed to update participant's details");
        } catch (err: unknown) {
            throw err;
        }
    }
}
