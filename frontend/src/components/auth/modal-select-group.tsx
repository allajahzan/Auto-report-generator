import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    ChevronLeft,
    Home,
    Loader2,
    Phone,
    UserRound,
    UsersRound,
} from "lucide-react";
import {
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
    type ChangeEvent,
} from "react";
import GroupList from "./groups-lists";
import {
    getParticipants,
    pariticipantsList,
    resultSubmitGroupAndParticipants,
    submitGroupAndParticipants,
} from "@/socket/io";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import profile from "@/assets/images/groups.svg";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { useNotification } from "@/context/notification-context";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import Loader from "../common/loader";
import NotFound from "../common/not-found";

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
    // Group states
    const [selectedGroup, setSelectedGroup] = useState<IGroup | null>(null);

    // Participants
    const [participants, setParticipants] = useState<
        {
            id: string;
            name: string;
            phoneNumber: string;
            role: string;
            profilePic: string;
        }[]
    >([]);

    const [fetching, setFetching] = useState<boolean>(false);

    // Batch name
    const batchName = useRef<string>("");
    const error = useRef<HTMLParagraphElement>(null);

    const [submiting, setSubmiting] = useState<boolean>(false);

    const navigate = useNavigate();

    // Auth context
    const { phoneNumber, setConnection, setGroupId } = useAuth();

    // Notifiation context
    const { setNotification } = useNotification();

    // Handle text change
    const handleTextChange = (
        e: ChangeEvent<HTMLInputElement>,
        type: "name" | "phoneNumber",
        phoneNumber: string
    ) => {
        setParticipants((prev) => {
            return prev.map((p) => {
                if (p.phoneNumber === phoneNumber) {
                    return {
                        ...p,
                        ...(type === "name"
                            ? { name: e.target.value }
                            : { phoneNumber: e.target.value.trim() }),
                    };
                } else {
                    return p;
                }
            });
        });
    };

    // Handle submit
    const handleSubmit = async () => {
        if (!batchName.current) {
            if (error.current) error.current.innerHTML = "Enter batch name";
            return;
        }

        if (error.current) error.current.innerHTML = "";

        // Restore
        localStorage.setItem("phoneNumber", phoneNumber);

        setSubmiting(true);

        submitGroupAndParticipants(
            selectedGroup?.id as string,
            batchName.current.toUpperCase(),
            participants.map((p) => ({
                id: p.id,
                name: p.name,
                phoneNumber: p.phoneNumber,
                role: p.role,
            })),
            phoneNumber
        );
    };

    // Emit get pariticipants event
    useLayoutEffect(() => {
        if (selectedGroup) {
            getParticipants(phoneNumber || "", selectedGroup?.id as string);
            setFetching(true);
        }
    }, [selectedGroup]);

    // Listen paricipants event
    useLayoutEffect(() => {
        pariticipantsList((participants) => {
            setParticipants(participants);
            setFetching(false);
        });
    }, []);

    // Listen for submit-group-and-participants event result
    useEffect(() => {
        if (submiting) {
            resultSubmitGroupAndParticipants((status: boolean) => {
                setSubmiting(status);
                if (status) {
                    setOpen(false);

                    // Auth states
                    localStorage.setItem("connection", "1");
                    setConnection(true);
                    localStorage.setItem("groupId", selectedGroup?.id as string);
                    setGroupId(selectedGroup?.id as string);

                    setNotification({
                        id: Date.now().toString(),
                        message: "You have successfully selected the group ✌️",
                    });

                    navigate(`/${phoneNumber}/${selectedGroup?.id}`);
                }
            });
        }
    }, [submiting]);

    // Clear states
    useEffect(() => {
        if (open) {
            setSelectedGroup(null);
            setParticipants([]);
            if (batchName.current) {
                batchName.current = "";
            }
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent
                onClick={(e) => e.preventDefault()}
                className="w-full sm:max-w-xl flex flex-col gap-10 bg-my-bg border border-zinc-800 h-[86vh]"
            >
                <DialogHeader>
                    <DialogTitle className="text-white text-base flex items-center gap-3 text-start w-[calc(100%-5%)]">
                        <span>
                            {!selectedGroup
                                ? "Select a group to be tracked by Report Buddy."
                                : "Complete the form below to proceed."}
                        </span>
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground font-medium text-xs text-start">
                        {!selectedGroup
                            ? "Report Buddy will track the selected group and generate daily reports."
                            : "These are the details of the group (your batch) you've selected."}
                    </DialogDescription>
                </DialogHeader>

                {/* Groups lists */}
                {!selectedGroup && (
                    <div className="h-full flex flex-col gap-4 overflow-hidden">
                        {/* Title */}
                        <div className="flex items-center gap-2 text-white">
                            <div className="p-2 rounded-full text-white">
                                <UsersRound className="w-4 h-4" />
                            </div>
                            <p className="font-medium text-sm">Whatspp groups</p>
                        </div>

                        <div className="h-full flex flex-col gap-2 text-white font-medium overflow-auto no-scrollbar">
                            {/* Lists */}
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

                            {/* No list */}
                            {groups.length === 0 && <NotFound message="No groups found" />}
                        </div>
                    </div>
                )}

                {/* Batch details */}
                {selectedGroup && (
                    <div className="h-full flex flex-col gap-3 overflow-hidden">
                        {/* Title */}
                        <div
                            onClick={() => {
                                setSelectedGroup(null);
                                setParticipants([]);
                            }}
                            className="flex items-center gap-2 text-white cursor-pointer"
                        >
                            <div className="p-2 rounded-full text-zinc-100">
                                <ChevronLeft className="w-4 h-4" />
                            </div>
                            <p className="font-medium text-sm">{selectedGroup.name}</p>
                        </div>

                        {/* Details */}
                        <div className="h-full flex flex-col gap-2 text-white font-medium overflow-auto no-scrollbar">
                            {/* Batch name */}
                            <Label
                                htmlFor="batchname"
                                className="text-xs text-white font-medium"
                            >
                                Batch Name
                            </Label>
                            <div className="relative flex-1">
                                <Input
                                    id="batchname"
                                    required
                                    autoComplete="off"
                                    defaultValue={batchName.current}
                                    onChange={(e) => (batchName.current = e.target.value)}
                                    placeholder={`Enter batch name`}
                                    className="text-white text-sm font-medium p-5 pl-9 border border-zinc-800 hover:border-zinc-600 bg-black hover:bg-my-bg-light"
                                />
                                <Home className="w-4 h-4 absolute left-3 top-[13px] text-muted-foreground" />
                            </div>

                            {/* Error */}
                            <p
                                ref={error}
                                className="relative -top-1 font-medium text-xs text-red-600"
                            ></p>

                            {/* Participants */}
                            <Label className="text-xs text-white font-medium">
                                Participants
                            </Label>

                            {/* Lists */}
                            <div className="h-full flex flex-col gap-2">
                                {!fetching &&
                                    participants.length > 0 &&
                                    participants.map((p, index) => (
                                        <motion.div
                                            initial={{ opacity: 0, y: -20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.2 + index * 0.1 }}
                                            key={index}
                                            className="flex items-center gap-2"
                                        >
                                            {/* Profile pic */}
                                            <Avatar className="bg-background w-10 h-10 border-2 border-zinc-800 shadow-md">
                                                <AvatarImage
                                                    src={p.profilePic}
                                                    className="object-cover"
                                                />
                                                <AvatarFallback className="bg-zinc-300">
                                                    <img className="w-full" src={profile} alt="" />
                                                </AvatarFallback>
                                            </Avatar>

                                            {/* Phone number */}
                                            <div className="relative flex-1">
                                                <Input
                                                    id={index.toString() + "phoneNumber"}
                                                    required
                                                    value={p.phoneNumber}
                                                    readOnly
                                                    placeholder={`Enter phone number`}
                                                    className="text-white text-sm font-medium p-5 pl-9 border border-zinc-800 hover:border-zinc-600 bg-black hover:bg-my-bg-light"
                                                />
                                                <Phone className="w-4 h-4 absolute left-3 top-[13px] text-muted-foreground" />
                                            </div>

                                            {/* Name */}
                                            <div className="relative flex-1">
                                                <Input
                                                    id={index.toString() + "name"}
                                                    required
                                                    autoComplete="off"
                                                    value={p.name}
                                                    onChange={(e) =>
                                                        handleTextChange(e, "name", p.phoneNumber)
                                                    }
                                                    placeholder={`Enter name`}
                                                    className="text-white text-sm font-medium p-5 pl-9 border border-zinc-800 hover:border-zinc-600 bg-black hover:bg-my-bg-light"
                                                />
                                                <UserRound className="w-4 h-4 absolute left-3 top-[13px] text-muted-foreground" />
                                            </div>
                                        </motion.div>
                                    ))}

                                {/* If no participants */}
                                {!fetching && participants.length === 0 && (
                                    <NotFound message="No participants found" />
                                )}

                                {/* Loader */}
                                {fetching && (
                                    <div className="h-full flex items-center justify-center">
                                        <Loader />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Submit button */}
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
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

export default SelectGroupModal;
