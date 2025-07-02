import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ChevronLeft, Home, Phone, UserRound, UsersRound } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import profile from "@/assets/images/groups.svg";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchData } from "@/service/apiService";
import { API_END_POINTS } from "@/constants/apiEndpoints";
import { errorHandler } from "@/utils/errorHandler";
import { GroupList } from "./GroupList";
import { ModalConfirmSelect } from "./ModalConfirmSelect";
import { Loader } from "@/components/common/Loader";
import { NotFound } from "@/components/common/NotFound";

// Interface for group
export interface IGroup {
    id: string;
    name: string;
    profilePic: string;
}

// Interface for participant
export interface IParticipant {
    id: string;
    name: string;
    phoneNumber: string;
    role: string;
    profilePic: string;
}

// Inteface for Props
interface PropsType {
    open: boolean;
    setOpen: (open: boolean) => void;
    groups: IGroup[];
}

// Select group modal Component
export function ModalSelectGroup({ open, setOpen, groups }: PropsType) {
    // Group states
    const [selectedGroup, setSelectedGroup] = useState<IGroup | null>(null);

    // Participants
    const [participants, setParticipants] = useState<IParticipant[] | []>([]);

    // Batch name
    const batchName = useRef<string>("");
    const nameError = useRef<HTMLParagraphElement>(null);

    // Modal state
    const [confirmOpen, setConfirmOpen] = useState<boolean>(false);

    // Query client
    const queryClient = useQueryClient();

    // Auth context
    const { phoneNumber, setConnection, clearAuth } = useAuth();

    // Notification context
    const { notify } = useNotification();

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

    // useQuery for fetching participants
    const { data, isLoading, error } = useQuery({
        queryKey: ["participants", selectedGroup?.id],
        queryFn: async () => {
            // Send request
            const resp = await fetchData(
                API_END_POINTS.PARTICIPANT +
                `?groupId=${selectedGroup?.id}&coordinatorId=${phoneNumber}`
            );

            // Success response
            if (resp && resp.status === 200) {
                return resp.data?.data;
            }
        },
        refetchOnWindowFocus: false,
        enabled: !!selectedGroup,
        retry: false,
    });

    // Set participants
    useEffect(() => {
        if (data) {
            setParticipants(data);
        }
    }, [data]);

    // Handle error
    useEffect(() => {
        if (error) {
            errorHandler(error, notify, setConnection, clearAuth);
        }
    }, [error]);

    // Handle submit
    const handleSubmit = async () => {
        if (!batchName.current) {
            if (nameError.current) nameError.current.innerHTML = "Enter batch name";
            return;
        }

        if (nameError.current) nameError.current.innerHTML = "";

        // Open confirm modal
        setConfirmOpen(true);
    };

    // Clear states
    useEffect(() => {
        if (open) {
            setSelectedGroup(null);
            setParticipants([]);
            if (batchName.current) {
                batchName.current = "";
            }
        }

        return () => {
            queryClient.removeQueries({ queryKey: ["participants"] });
        };
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent
                onClick={(e) => e.preventDefault()}
                className="w-full sm:max-w-xl flex flex-col gap-10 bg-my-bg border border-zinc-800 h-[86vh] text-white"
            >
                <DialogHeader>
                    <DialogTitle className="text-white text-base flex items-center gap-3 text-start w-[calc(100%-5%)]">
                        <span>
                            {!selectedGroup
                                ? "Select a WhatsApp group to be tracked by Report Buddy."
                                : "Complete the form below to proceed (Name is optional)."}
                        </span>
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground font-medium text-xs text-start">
                        {!selectedGroup
                            ? "Report Buddy will track the selected WhatsApp group to generate task reports."
                            : "These are the details of the WhatsApp group (your batch) you've selected."}
                    </DialogDescription>
                </DialogHeader>

                {/* Groups lists */}
                {!isLoading && !selectedGroup && (
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
                                            action={() => setSelectedGroup(groups[index])}
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
                {!isLoading && selectedGroup && (
                    <div className="h-full flex flex-col gap-3 overflow-hidden">
                        {/* Title */}
                        <div
                            onClick={() => {
                                setSelectedGroup(null);
                                setParticipants([]);
                                batchName.current = "";
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
                                ref={nameError}
                                className="relative -top-1 font-medium text-xs text-red-600"
                            ></p>

                            {/* Participants */}
                            <Label className="text-xs text-white font-medium">
                                Participants
                            </Label>

                            {/* Lists */}
                            <div className="h-full flex flex-col gap-2">
                                {participants?.length > 0 &&
                                    participants?.map((p, index) => (
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
                                {participants?.length === 0 && (
                                    <div className="h-full flex items-center justify-center">
                                        <NotFound message="No participants found" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Submit button */}

                        <div className="flex justify-end gap-2">
                            <Button
                                onClick={handleSubmit}
                                className="h-11 w-full text-center cursor-pointer disabled:cursor-not-allowed 
                                        shadow-none bg-white hover:bg-muted dark:bg-muted dark:hover:bg-muted text-foreground"
                            >
                                Submit
                            </Button>
                        </div>
                    </div>
                )}

                {/* Loader */}
                {isLoading && (
                    <div className="h-full flex items-center justify-center">
                        <Loader />
                    </div>
                )}

                {/* Confirm modal */}
                <ModalConfirmSelect
                    open={confirmOpen}
                    setOpen={setConfirmOpen}
                    selectedGroup={selectedGroup}
                    batchName={batchName.current}
                    participants={participants}
                />
            </DialogContent>
        </Dialog>
    );
}
