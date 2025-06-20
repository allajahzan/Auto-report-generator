import { motion } from "framer-motion";
import type { LucideProps } from "lucide-react";

// Interface for Props
interface PropsType {
    rotation?: number;
    delay?: number;
    Icon?: React.ForwardRefExoticComponent<
        Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
    >;
}

// Orbiting Icon Component
function OrbitingIcon({ delay, rotation, Icon }: PropsType) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay }}
            style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                transform: `rotate(${rotation}deg)`,
            }}
        >
            <motion.div
                animate={{ rotate: 360 }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                }}
                style={{
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    transformOrigin: "center",
                }}
            >
                <div
                    className="absolute p-2 bg-black border border-zinc-800 shadow-md rounded-lg"
                    style={{
                        transform: "translate(-50%, -50%)",
                        left: "0%",
                        top: "50%",
                    }}
                >
                    {Icon && <Icon className="w-3 h-3 text-white" />}
                </div>
            </motion.div>
        </motion.div>
    );
}

export default OrbitingIcon;
