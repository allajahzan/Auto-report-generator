import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Briefcase, Dot, Edit, MoreVertical, Phone } from "lucide-react";
import profile from "@/assets/images/groups.svg";
import { motion } from "framer-motion";
// import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import EditParticipantModal from "../coordinator/modal-edit-participant";
import { useState } from "react";

// Interface for Props
interface PropsType {
    data: {
        id: string;
        name: string;
        phoneNumber: string;
        role: string;
        profilePic: string;
    };
    isMoreOption?: boolean;
    showRole?: boolean;
}

// Name card Component
function NameCard({ data, showRole, isMoreOption }: PropsType) {
    // Edit modal state
    const [open, setOpen] = useState<boolean>(false);

    return (
        <div className="group flex items-center gap-3">
            {/* Avatar profile pic */}
            <motion.div
                key={data.id}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <Avatar className="bg-background w-12 h-12 border-2 border-background dark:border-border shadow-md">
                    <AvatarImage src={data.profilePic} className="object-cover" />
                    <AvatarFallback className="bg-transparent">
                        <img src={profile} alt="" />
                    </AvatarFallback>
                </Avatar>
            </motion.div>

            {/* Name and details */}
            <div className="flex-1 flex flex-col justify-center gap-0 min-w-0">
                <div className="flex items-center gap-2">
                    <p className="text-base text-white font-semibold truncate">
                        {data.name || "Unknown"}
                    </p>
                    {/* <Badge className="relative text-[11px] tracking-wider text-black font-normal bg-white hover:bg-white rounded-full overflow-hidden shadow">
                        {data.role || "Paricipant"}
                    </Badge> */}
                </div>
                <p className="text-xs text-white font-medium tracking-wide flex items-center w-full truncate">
                    <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3 shrink-0" />
                        {data.phoneNumber}
                    </span>

                    {showRole && (
                        <>
                            <Dot />
                            <span className="flex items-center gap-1">
                                <Briefcase className="w-3 h-3 shrink-0" />
                                {data.role}
                            </span>
                        </>
                    )}
                </p>
            </div>

            {/* More */}
            {isMoreOption && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild className="cursor-pointer">
                        <div className="p-2">
                            <MoreVertical className="w-4 h-4 text-white" />
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        onClick={(e) => e.stopPropagation()}
                        className="bg-my-bg-light border border-zinc-800"
                        align="end"
                    >
                        <DropdownMenuItem
                            onClick={() => setOpen(true)}
                            className="text-white bg-my-bg-light hover:bg-my-bg-dark cursor-pointer"
                        >
                            <Edit className="w-4 h-5" />
                            Edit
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}

            {/* Edit participant modal */}
            <EditParticipantModal open={open} setOpen={setOpen} data={data} />
        </div>
    );
}

export default NameCard;
