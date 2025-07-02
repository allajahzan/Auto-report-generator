import type { IBatch } from "@/types/IBatch";
import { NameCard } from "@/components/common/NameCard";
import { Plus, UserRound } from "lucide-react";
import { ModalAddParticipant } from "./ModalAddParticipant";

// Interface for Props
interface PropsType {
    data: IBatch;
}

// Users
export function Users({ data }: PropsType) {
    return (
        <>
            <div className=" relative w-full h-fit p-5 flex flex-col gap-5 bg-my-bg-light rounded-2xl shadow">
                {/* Title */}
                <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-full bg-zinc-800 text-white cursor-pointer">
                            <UserRound className="w-4 h-4" />
                        </div>
                        <h1 className="text-lg font-extrabold text-white tracking-wide">
                            Batch Coordinator
                        </h1>
                    </div>
                </div>

                {/* Name and details */}
                <div className="flex flex-col gap-5 p-3 bg-my-bg-dark rounded-lg shadow">
                    <NameCard
                        data={
                            data.participants.find(
                                (p: any) => p.phoneNumber === data.coordinatorId
                            ) as IBatch["participants"][0]
                        }
                        showRole={true}
                        isMoreOption={false}
                    />
                </div>
            </div>

            {/* Participants */}
            <div className=" relative w-full h-fit p-5 flex flex-col gap-5 bg-my-bg-light rounded-2xl shadow">
                {/* Title */}
                <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-full bg-zinc-800 text-white cursor-pointer">
                            <UserRound className="w-4 h-4" />
                        </div>
                        <h1 className="text-lg font-extrabold text-white tracking-wide">
                            Participants
                        </h1>
                    </div>

                    {/* Add modal */}
                    <ModalAddParticipant
                        children={
                            <div className="p-2 rounded-full hover:bg-zinc-800 text-white cursor-pointer">
                                <Plus className="w-4 h-4" />
                            </div>
                        }
                    />
                </div>

                {/* Name and details */}
                <div className="flex flex-col gap-2">
                    {data.participants.map((p: any, index: number) => (
                        <div key={index} className="p-3 bg-my-bg-dark rounded-lg shadow">
                            <NameCard
                                key={p.id}
                                data={p}
                                isMoreOption={true}
                                showRole={true}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
