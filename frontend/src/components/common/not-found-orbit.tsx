import OrbitingIcon from "@/components/animation/oribiting-icon";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { LucideProps } from "lucide-react";

// Interface for Props
interface PropsType {
    MainIcon?: React.ForwardRefExoticComponent<
        Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
    >;
    SubIcon?: React.ForwardRefExoticComponent<
        Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
    >;
    text?: string;
    message?: string;
    className?: string;
}

// NotFound Orbit Component
function NotFoundOrbit({
    MainIcon,
    SubIcon,
    text,
    message,
    className,
}: PropsType) {
    return (
        <div
            className={cn(
                "relative h-full p-5 flex flex-col gap-7 items-center justify-center rounded-2xl overflow-hidden border border-zinc-800 shadow-sm",
                className
            )}
        >
            <div className="relative w-[185px] h-[185px]">
                {/* Inner orbit */}
                <div className="absolute top-[50%] -translate-y-1/2 right-[50%] translate-x-1/2 w-[185px] h-[185px] rounded-full border border-dashed border-muted-foreground/20">
                    <OrbitingIcon rotation={180} delay={0.3} Icon={SubIcon} />
                </div>

                {/* Inner orbit */}
                <div className="absolute top-[50%] -translate-y-1/2 right-[50%] translate-x-1/2 w-[125px] h-[125px] rounded-full border border-dashed border-muted-foreground/20">
                    <OrbitingIcon rotation={90} delay={0.5} Icon={SubIcon} />
                    <OrbitingIcon rotation={270} delay={0.7} Icon={SubIcon} />
                    <OrbitingIcon rotation={360} delay={0.9} Icon={SubIcon} />
                </div>

                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="p-3 bg-transparent border-2 border-dashed border-muted-foreground rounded-full"
                    >
                        {MainIcon && <MainIcon className="w-5 h-5 text-muted-foreground" />}
                    </motion.div>
                </div>
            </div>

            {/* message */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center space-y-1 text-sm"
            >
                <h3 className="text-white font-semibold">{text}</h3>
                <p className="text-muted-foreground font-medium">{message}</p>
            </motion.div>
        </div>
    );
}

export default NotFoundOrbit;
