import { IBatchService } from "../interface/IBatchService";
import { IBatchRepository } from "../../repository/interface/IBatchRepository";
import {
    ForbiddenError,
    NotFoundError,
    UnauthorizedError,
} from "@codeflare/common";
import { getSocket } from "../../bot/socket-store";
import { IBatchDto } from "../../dto/batchDto";
import fs from "fs";

// Implementation for Batch Service
export class BatchService implements IBatchService {
    private batchRepository: IBatchRepository;

    constructor(batchRepository: IBatchRepository) {
        this.batchRepository = batchRepository;
    }

    async getBatch(groupId: string, coordinatorId: string): Promise<IBatchDto> {
        try {
            const batch = await this.batchRepository.findOne({
                groupId,
                coordinatorId,
            });

            if (!batch) throw new NotFoundError("Batch not found !");

            const phoneNumber = coordinatorId;

            // Check if auth_info directory exists or empty
            const auth_info_dir = `src/auth_info/${phoneNumber}`;

            if (
                !fs.existsSync(auth_info_dir) ||
                fs.readdirSync(auth_info_dir).length === 0
            ) {
                throw new UnauthorizedError("auth_info not found or is empty!");
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
}
