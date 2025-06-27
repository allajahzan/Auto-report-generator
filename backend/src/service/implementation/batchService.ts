import { IBatchService } from "../interface/IBatchService";
import { IBatchRepository } from "../../repository/interface/IBatchRepository";
import {
    BadRequestError,
    ConflictError,
    ForbiddenError,
    NotFoundError,
    UnauthorizedError,
} from "@codeflare/common";
import { getSocket, removeSocket } from "../../bot/socket-store";
import { IBatchDto, IParticipantDto } from "../../dto/batchDto";
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
                            role: p.role,
                        };
                    })
                ),
                audioTaskTopic: batch.audioTaskTopic,
                isTrackingEnabled: batch.isTrackingEnabled,
                isSharingEnabled: batch.isSharingEnabled,
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

    // Get participants
    async getParticipants(
        groupId: string,
        coordinatorId: string
    ): Promise<IParticipantDto[]> {
        try {
            const sock = getSocket(coordinatorId);
            if (!sock) throw new ForbiddenError();

            const batch = await this.batchRepository.findOne({ groupId });

            // If batch doesn't exist
            if (!batch) {
                const metadata = await sock.groupMetadata(groupId);
                return Promise.all(
                    metadata.participants.map(async (p) => ({
                        id: p.id,
                        name: p.name || "",
                        phoneNumber: p.id.split("@")[0].slice(2),
                        profilePic:
                            (await sock.profilePictureUrl(p.id, "image").catch(() => "")) ||
                            "",
                        role: "",
                    }))
                );
            }

            // If batch exists, coordinatorId is not set or coordinatorId is equal
            if (!batch.coordinatorId || batch.coordinatorId === coordinatorId) {
                return Promise.all(
                    batch.participants.map(async (p) => ({
                        id: p.id,
                        name: p.name || "",
                        phoneNumber: p.phoneNumber,
                        profilePic:
                            (await sock.profilePictureUrl(p.id, "image").catch(() => "")) ||
                            "",
                        role: p.role || "",
                    }))
                );
            }

            // If coordinatorId is not equal
            throw new ConflictError(
                "This group is already managed by another coordinator"
            );
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

    // Select group
    async selectGroup(
        groupId: string,
        coordinatorId: string,
        data: Partial<IBatchSchema>
    ): Promise<void> {
        try {
            // Check batch exists or not
            const batch = await this.batchRepository.findOne({ groupId });

            if (
                batch &&
                batch.coordinatorId &&
                batch.coordinatorId !== coordinatorId
            ) {
                throw new ConflictError(
                    "This group is already managed by another coordinator"
                );
            }

            const updatedBatch = await this.batchRepository.update(
                { groupId },
                {
                    $set: {
                        coordinatorId,
                        batchName: data.batchName,
                        participants: data.participants,
                    },
                },
                { upsert: true }
            );

            if (!updatedBatch) throw new BadRequestError("Failed to select group");
        } catch (err: unknown) {
            throw err;
        }
    }

    // Disconnect
    async disconnect(groupId: string, coordinatorId: string): Promise<void> {
        try {
            // Remove coordinatorId
            const updatedBatch = await this.batchRepository.update(
                { groupId, coordinatorId },
                { $unset: { coordinatorId: 1 } }
            );

            if (!updatedBatch) throw new BadRequestError("Failed to disconnect");

            const phoneNumber = coordinatorId;
            const sock = getSocket(phoneNumber);

            if (sock) {
                await sock.logout();
                removeSocket(phoneNumber);
            }
        } catch (err: unknown) {
            throw err;
        }
    }
}
