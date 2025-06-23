import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import profile from "@/assets/images/groups.svg";
import type { IGroup } from "./modal-select-group";

// Interface for Props
interface PropsType {
    index: number;
    action: any;
    group: IGroup;
    selectedGroup: IGroup | null;
    className: string;
}

// Gorup list Component
function GroupList({
    index,
    action,
    group,
    selectedGroup,
    className,
}: PropsType) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            onClick={() => action()}
            className={cn(
                "group p-2 px-3 w-full flex flex-col rounded-lg cursor-pointer bg-my-bg-dark shadow-sm",
                className,
                selectedGroup?.id === group.id ? "bg-[#151515]" : ""
            )}
        >
            <div className="flex items-center gap-3">
                {/* Avatar profile pic */}
                <Avatar className="bg-background w-10 h-10 border-2 border-zinc-800 shadow-md">
                    <AvatarImage src={group.profilePic} className="object-cover" />
                    <AvatarFallback className="bg-zinc-300">
                        <img className="w-full" src={profile} alt="" />
                    </AvatarFallback>
                </Avatar>

                {/* Name and other details */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm text-white truncate">
                            {group.name}
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default GroupList;
