import {
    BadRequestError,
    ConflictError,
    ForbiddenError,
    NotFoundError,
} from "@codeflare/common";
import { IBatchService } from "../interfaces";
import { IBatchRepository } from "../../repository/interfaces";
import { IBatchDto, IParticipantDto } from "../../dtos";
import { getSocket, removeSocket } from "../../bot";
import { IBatchSchema } from "../../entities";
import { withTimeout } from "../../utils";

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

            if (!batch) throw new NotFoundError("This batch not found");

            const sock = getSocket(coordinatorId);
            if (!sock) throw new ForbiddenError();

            // Map data to return type
            const batchDto: IBatchDto = {
                _id: batch._id as unknown as string,
                coordinatorId,
                groupId,
                batchName: batch.batchName,
                participants: await Promise.all(
                    batch.participants.map(async (p) => {
                        let profilePic = "";
                        try {
                            profilePic = await withTimeout(
                                sock.profilePictureUrl(p.id, "image"),
                                500,
                                ""
                            );
                        } catch (err) {
                            profilePic = "";
                        }

                        // Delay
                        await new Promise((res) => setTimeout(res, 100));

                        return {
                            id: p.id,
                            name: p.name,
                            phoneNumber: p.phoneNumber,
                            profilePic: profilePic,
                            role: p.role,
                        };
                    })
                ),
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
            const phoneNumber = coordinatorId;
            const sock = getSocket(phoneNumber);
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
                        profilePic: await withTimeout(
                            sock.profilePictureUrl(p.id, "image"),
                            500,
                            ""
                        ),
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
                        profilePic: await withTimeout(
                            sock.profilePictureUrl(p.id, "image"),
                            500,
                            ""
                        ),
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

    // Add participants
    async addParticipants(
        groupId: string,
        coordinatorId: string,
        participant: { id: string; name: string; phoneNumber: string; role: string }
    ): Promise<void> {
        try {
            const batch = await this.batchRepository.findOne({
                groupId,
                coordinatorId,
            });

            if (!batch) throw new BadRequestError("This batch not found");

            // Existing participants
            const existingParticipants = new Set(
                batch.participants.map((p) => p.phoneNumber)
            );

            // Check weather participant exists or not
            if (existingParticipants.has(participant.phoneNumber)) {
                throw new BadRequestError("This participant already exists");
            } else {
                const phoneNumber = coordinatorId;
                const sock = getSocket(phoneNumber);
                if (!sock) throw new ForbiddenError();

                // Group metadata
                const metadata = await sock.groupMetadata(groupId);
                const newParticipant = metadata.participants.find(
                    (p) => p.id.split("@")[0].slice(2) === participant.phoneNumber
                );

                if (!newParticipant)
                    throw new BadRequestError("Participant not found in WhatsApp group");

                participant.id = newParticipant.id || "";
            }

            const updatedBatch = await this.batchRepository.update(
                { coordinatorId, groupId },
                { $addToSet: { participants: participant } },
                { new: true }
            );

            if (!updatedBatch)
                throw new BadRequestError("Failed to add new participant");
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
                { upsert: true, new: true }
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
                { $unset: { coordinatorId: 1 } },
                { new: true }
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
