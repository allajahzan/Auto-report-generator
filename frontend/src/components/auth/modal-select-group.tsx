import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import {
    ChevronLeft,
    Focus,
    Loader2,
    Phone,
    UserRound,
    UsersRound,
} from "lucide-react";
import { useEffect, useLayoutEffect, useState, type ChangeEvent } from "react";
import NotFoundOrbit from "../common/not-found-orbit";
import GroupList from "./groups-lists";
import {
    getParticipants,
    pariticipantsList,
    resultSubmitGroupAndParticipants,
    submitGroupAndParticipants,
} from "@/socket/bot";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import profile from "@/assets/images/groups.svg";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

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
        { name: string; phoneNumber: string; profilePic: string }[]
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

    // Handle submit
    const handleSubmit = async () => {
        setSubmiting(true);
        submitGroupAndParticipants(
            selectedGroup?.id as string,
            participants.map((parti) => ({
                name: parti.name,
                phoneNumber: parti.phoneNumber,
            }))
        );
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

    // Listen for submit-group-and-participants event result
    useEffect(() => {
        if (submiting) {
            resultSubmitGroupAndParticipants((status: boolean) => {
                setSubmiting(status);
                if (status) {
                    setOpen(false);
                }
            });
        }
    }, [submiting]);

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
                className="w-full sm:max-w-2xl flex flex-col gap-10 bg-my-bg-light border border-zinc-800 h-[86vh]"
            >
                <DialogHeader>
                    <DialogTitle className="text-white text-base flex items-center gap-3 text-start w-[calc(100%-5%)]">
                        <div className="p-2 bg-zinc-800 rounded-full self-start">
                            <UsersRound className="w-4 h-4" />
                        </div>
                        <span>
                            {!selectedGroup
                                ? "Select a group you wanna get tracked by report buddy"
                                : "Fill only students name of corresponding phone number"}
                        </span>
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground font-medium text-xs text-start">
                        {!selectedGroup
                            ? "The selected group will be tracked by report buddy to make reports for all days."
                            : "This will be the name used in reports for the corresponding phone number."}
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

                {/* Participants lists */}
                {selectedGroup && (
                    <div className="h-full flex flex-col gap-5 overflow-hidden">
                        {/* Go back */}
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

                        {/* Lists */}
                        <div className="flex flex-col gap-2 text-white font-medium overflow-auto no-scrollbar">
                            {participants.map((parti, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    {/* Profile pic */}
                                    <Avatar className="bg-background w-10 h-10 border-2 border-zinc-800 shadow-md">
                                        <AvatarImage
                                            src={parti.profilePic}
                                            className="object-cover"
                                        />
                                        <AvatarFallback className="bg-zinc-300">
                                            <img className="w-full" src={profile} alt="" />
                                        </AvatarFallback>
                                    </Avatar>

                                    {/* Phone number */}
                                    <div className="space-y-2 flex-1">
                                        {/* <Label
                                            htmlFor={index.toString() + "phone-number"}
                                            className="text-xs text-white font-medium"
                                        >
                                            Phone Number
                                        </Label> */}
                                        <div className="relative">
                                            <Input
                                                id={index.toString() + "phone-number"}
                                                required
                                                readOnly
                                                value={parti.phoneNumber}
                                                onChange={(e) =>
                                                    handleTextChange(e, "phone-number", parti.phoneNumber)
                                                }
                                                placeholder={`Enter phone number`}
                                                className="text-white text-sm font-medium p-5 pl-9 border border-zinc-800 hover:border-zinc-600 bg-black hover:bg-my-bg-dark"
                                            />
                                            <Phone className="w-4 h-4 absolute left-3 top-[13px] text-muted-foreground" />
                                        </div>
                                    </div>

                                    {/* Name */}
                                    <div className="space-y-2 flex-1">
                                        {/* <Label
                                            htmlFor={index.toString() + "name"}
                                            className="text-xs text-white font-medium"
                                        >
                                            Student Name
                                        </Label> */}
                                        <div className="relative">
                                            <Input
                                                id={index.toString() + "name"}
                                                required
                                                value={parti.name}
                                                onChange={(e) =>
                                                    handleTextChange(e, "name", parti.phoneNumber)
                                                }
                                                placeholder={`Enter name`}
                                                className="text-white text-sm font-medium p-5 pl-9 border border-zinc-800 hover:border-zinc-600 bg-black hover:bg-my-bg-dark"
                                            />
                                            <UserRound className="w-4 h-4 absolute left-3 top-[13px] text-muted-foreground" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {selectedGroup && (
                    <div className="flex justify-end gap-2">
                        <Button
                            disabled={submiting || !selectedGroup}
                            onClick={handleSubmit}
                            className="h-11 w-full text-center cursor-pointer disabled:cursor-not-allowed 
                        shadow-none bg-muted hover:bg-muted dark:bg-muted dark:hover:bg-muted text-foreground"
                        >
                            {submiting ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Processing...
                                </div>
                            ) : (
                                "Submit"
                            )}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

export default SelectGroupModal;
