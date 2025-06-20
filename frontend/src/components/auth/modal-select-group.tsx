import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import { ChevronLeft, Focus, Loader2, UsersRound } from "lucide-react";
import { useEffect, useLayoutEffect, useState, type ChangeEvent } from "react";
import NotFoundOrbit from "../common/not-found-orbit";
import GroupList from "./groups-lists";
import { getParticipants, pariticipantsList } from "@/socket/bot";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

// Interface for group
export interface IGroup {
    id: string;
    name: string;
    profilePic: string;
}

// Inteface for Props
interface PropsType {
    open: boolean;
    setOpen: (open: boolean) => void;
    groups: IGroup[];
}

// Select group modal Component
function SelectGroupModal({ open, setOpen, groups }: PropsType) {
    // Phone number
    const phoneNumber = localStorage.getItem("phone-number");

    // Group states
    const [selectedGroup, setSelectedGroup] = useState<IGroup | null>(null);

    // Participants
    const [participants, setParticipants] = useState<
        { phoneNumber: string; name: string }[]
    >([]);

    const [submiting, setSubmiting] = useState<boolean>(false);

    // Handle text change
    const handleTextChange = (
        e: ChangeEvent<HTMLInputElement>,
        type: "name" | "phone-number",
        phoneNumber: string
    ) => {
        setParticipants((prev) => {
            return prev.map((parti) => {
                if (parti.phoneNumber === phoneNumber) {
                    return {
                        ...parti,
                        ...(type === "name"
                            ? { name: e.target.value }
                            : { phoneNumber: e.target.value }),
                    };
                } else {
                    return parti;
                }
            });
        });
    };

    // Emit get pariticipants event
    useLayoutEffect(() => {
        if (selectedGroup) {
            getParticipants(phoneNumber || "", selectedGroup?.id as string);
        }
    }, [selectedGroup]);

    // Listen paricipants event
    useLayoutEffect(() => {
        pariticipantsList((participants) => {
            setParticipants(participants);
        });
    }, []);

    // Clear states
    useEffect(() => {
        if (open) {
            setSelectedGroup(null);
            setParticipants([]);
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent
                onClick={(e) => e.preventDefault()}
                className="w-full sm:max-w-xl flex flex-col gap-10 bg-my-bg-light border border-zinc-800 h-[86vh]"
            >
                <DialogHeader>
                    <DialogTitle className="text-white text-base flex items-center gap-3 text-start w-[calc(100%-5%)]">
                        <div className="p-2 bg-zinc-800 rounded-full self-start">
                            <UsersRound className="w-4 h-4" />
                        </div>
                        <span>
                            {!selectedGroup
                                ? "Select a group you wanna get tracked by report buddy"
                                : "Fill the students name of corresponding phone number"}
                        </span>
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground font-medium text-xs text-start">
                        {!selectedGroup
                            ? "The selected group will be tracked by report buddy to make reports for all days."
                            : "This will be the names used in reports for the corresponding phone numbers."}
                    </DialogDescription>
                </DialogHeader>

                {/* Groups lists */}
                {!selectedGroup && (
                    <div className="flex flex-col gap-2 text-white font-medium overflow-auto no-scrollbar">
                        {groups.length > 0 &&
                            groups.map((grp, index) => {
                                return (
                                    <GroupList
                                        key={index}
                                        index={index}
                                        action={() => {
                                            setSelectedGroup(groups[index]);
                                        }}
                                        className=""
                                        group={grp}
                                        selectedGroup={selectedGroup}
                                    />
                                );
                            })}
                        {groups.length === 0 && (
                            <NotFoundOrbit
                                MainIcon={UsersRound}
                                SubIcon={Focus}
                                text="No groups found"
                                message="No groups in your whatsapp"
                                className="h-[320px]"
                            />
                        )}
                    </div>
                )}

                {selectedGroup && (
                    <div className="h-full flex flex-col gap-5 overflow-hidden">
                        <div
                            onClick={() => {
                                setSelectedGroup(null);
                                setParticipants([]);
                            }}
                            className="flex items-center gap-2 text-white cursor-pointer"
                        >
                            <div className="p-2 rounded-full hover:bg-zinc-800">
                                <ChevronLeft className="w-4 h-4" />
                            </div>
                            <p className="font-medium text-sm">{selectedGroup.name}</p>
                        </div>

                        <div className="flex flex-col gap-2 text-white font-medium overflow-auto no-scrollbar">
                            {participants.map((parti, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <Input
                                        placeholder="Phone Number"
                                        value={parti.phoneNumber}
                                        readOnly
                                        className="w-full p-5 pl-9 h-11 text-white text-sm font-medium border border-zinc-800"
                                    />
                                    <Input
                                        placeholder="Name"
                                        value={parti.name}
                                        onChange={(e) =>
                                            handleTextChange(e, "name", parti.phoneNumber)
                                        }
                                        className="w-full p-5 pl-9 h-11 text-white text-sm font-medium border border-zinc-800"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {selectedGroup && (
                    <div className="flex justify-end gap-2">
                        <Button
                            disabled={submiting || !selectedGroup}
                            className="h-11 w-full text-center cursor-pointer disabled:cursor-not-allowed 
                        shadow-none bg-muted hover:bg-muted dark:bg-muted dark:hover:bg-muted text-foreground"
                        >
                            {submiting ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Processing...
                                </div>
                            ) : (
                                "Select group"
                            )}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

export default SelectGroupModal;
