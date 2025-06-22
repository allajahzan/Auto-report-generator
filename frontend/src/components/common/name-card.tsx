import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone } from "lucide-react";
import profile from "@/assets/images/groups.svg";
import { motion } from "framer-motion";

// Interface for Props
interface PropsType {
    data: { id: string; name: string; phoneNumber: string; profilePic: string };
}

// Name card Component
function NameCard({ data }: PropsType) {
    return (
        <div className="flex items-center gap-3">
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
            <div className="flex-1 flex flex-col justify-center gap-1 min-w-0">
                <div className="flex items-center gap-2">
                    <p className="text-base text-white font-semibold truncate">
                        {data.name || "Participant"}
                    </p>
                </div>
                <p className="text-xs text-white font-medium tracking-wide flex items-center gap-1 w-full truncate">
                    <Phone className="w-3 h-3 flex-shrink-0" />
                    {data.phoneNumber}
                </p>
            </div>
        </div>
    );
}

export default NameCard;
