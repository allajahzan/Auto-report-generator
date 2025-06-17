import student from "@/assets/images/student.png";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Phone } from "lucide-react";
import { motion } from "framer-motion";
import { useMediaQuery } from "react-responsive";

// GetStarted Component
function GetStarted() {
    // Mobile size
    const isMobile = useMediaQuery({ maxWidth: 640 });

    return (
        <div className="h-full w-full flex items-center justify-center gap-32">
            {/* Left */}
            <div className="relative flex flex-col items-start justify-center scale-90">
                {/* Heading */}
                <motion.h1
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
                    className="text-3xl md:text-6xl font-bold text-white text-start font-serif leading-tight"
                >
                    <i>Your Smart</i> Session
                    <br />
                    Report buddy
                </motion.h1>

                {/* Sub heading */}
                <motion.p
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
                    className="font-normal italic text-center text-base md:text-3xl text-white py-4"
                >
                    Buddy you never had.
                </motion.p>

                {/* Form */}
                <form className="flex w-full gap-3 relative top-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            delay: 0.8,
                            duration: 0.6,
                            ease: "easeOut",
                        }}
                        className="relative shadow-md rounded-lg"
                    >
                        <Input
                            id="work"
                            type="text"
                            placeholder="Enter mobile number"
                            autoComplete="off"
                            className="p-5 pl-9 h-11 text-white font-medium dark:border-customBorder-dark
                                           focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:ring-offset-2 focus:ring-offset-black"
                        />
                        <Phone className="w-4 h-4 absolute left-3 top-[14px] text-muted-foreground" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                            delay: 0.8,
                            duration: 0.6,
                            ease: "easeOut",
                        }}
                        className="h-full flex items-center bg-muted shadow-md rounded-lg"
                    >
                        <Button
                            type="button"
                            className="h-11 w-20 sm:w-28 cursor-pointer disabled:cursor-not-allowed shadow-none bg-muted hover:bg-muted dark:bg-muted dark:hover:bg-muted text-foreground"
                        >
                            Get started
                        </Button>
                    </motion.div>
                </form>
            </div>

            {/* Right */}
            <motion.div
                initial={{ opacity: 0, y: isMobile ? -30 : -30 }}
                animate={{ opacity: 1, y: isMobile ? 0 : 0 }}
                transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
                className=" flex items-center justify-center"
            >
                <img
                    className="w-[16rem] transform scale-x-[-1] "
                    src={student}
                    alt=""
                />
            </motion.div>
        </div>
    );
}

export default GetStarted;
