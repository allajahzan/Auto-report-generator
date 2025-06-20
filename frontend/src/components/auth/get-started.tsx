import student from "@/assets/images/student.png";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Link, Loader2, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import QRCode from "react-qr-code";
import {
    botStatus,
    groupList,
    getQRcode,
    getStarted,
    refreshSocket,
} from "@/socket/bot";
import { toast } from "sonner";
import { sonnerStyle } from "@/lib/sonner-style";
import SelectGroupModal, { type IGroup } from "./modal-select-group";
import { useMediaQuery } from "react-responsive";

// GetStarted Component
function GetStarted() {
    // Modal state
    const [open, setOpen] = useState<boolean>(false);
    const [groups, setGroups] = useState<IGroup[] | []>([]);

    // Phone size
    const isMobile = useMediaQuery({ query: "(max-width: 620px)" });

    // Phone number
    const pn = localStorage.getItem("phone-number") || "";
    const phoneNumber = useRef<string>(pn);
    const error = useRef<HTMLParagraphElement>(null);

    // QR code
    const [qr, setQr] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

    // Handle get started
    const handleGetStarted = async () => {
        let regex = /^(?!0{10})([1-9][0-9]{9})$/;

        if (!phoneNumber.current) {
            if (error.current) error.current.innerHTML = "Enter phone number";
            return;
        }

        if (!regex.test(phoneNumber.current)) {
            if (error.current)
                error.current.innerHTML = "Enter 10 digits valid phone number";
            return;
        }

        // Emit event to get started
        getStarted(phoneNumber.current);

        // Store phone number
        localStorage.setItem("phone-number", phoneNumber.current);

        if (error.current) error.current.innerHTML = "";

        setLoading(true);
    };

    // Emit an event when page reload to refresh socket
    useEffect(() => {
        const handleLoad = () => {
            const navType = performance.getEntriesByType(
                "navigation"
            )[0] as PerformanceNavigationTiming;

            if (navType?.type === "reload") {
                if (phoneNumber.current) {
                    refreshSocket(phoneNumber.current);
                }
            }
        };

        window.addEventListener("load", handleLoad);

        return () => {
            window.removeEventListener("load", handleLoad);
        };
    }, []);

    // Listen for qr code
    useEffect(() => {
        getQRcode((qrCode: string) => {
            setQr(qrCode);
            toast("Scan this QR code, connect to report buddy 🔗", {
                position: "top-right",
                style: { ...sonnerStyle, ...(!isMobile && { width: "max-content" }) },
            });

            setLoading(false);
        });
    }, []);

    // Listen for BOT status
    useEffect(() => {
        botStatus((status, message) => {
            if (status === "re-connect") {
                setQr("");
                setLoading(false);
            } else if (
                status === "expired" ||
                status === "disconnected" ||
                status === "error"
            ) {
                setQr("");
                setLoading(false);

                // Remove phone number
                localStorage.removeItem("phone-number");
            }

            toast(message, {
                position: "top-right",
                style: { ...sonnerStyle, ...(!isMobile && { width: "max-content" }) },
            });
        });
    }, []);

    // Listen for group list
    useEffect(() => {
        groupList((grplist) => {
            setGroups(grplist);
            setOpen(true);
            setQr("");
            setLoading(false);
        });
    }, []);

    return (
        <div className="w-full max-w-6xl mx-auto h-full flex flex-col md:flex-row items-center justify-center gap-12 p-5">
            {/* Left Side */}
            <div className="flex flex-col items-center md:items-start justify-center">
                <motion.h1
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-bold text-white text-center md:text-left font-serif leading-tight"
                >
                    <i>Your Smart</i> Session
                    <br />
                    Report buddy
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
                    className="font-normal italic text-center md:text-left text-lg sm:text-xl md:text-2xl text-white py-4"
                >
                    Buddy you never had.
                </motion.p>

                <div className="flex flex-col sm:flex-row gap-3 mt-6 w-full max-w-md">
                    <div className="relative flex flex-col gap-2">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
                            className="shadow-md rounded-lg w-full"
                        >
                            <Input
                                id="work"
                                type="text"
                                placeholder="Enter mobile number"
                                autoComplete="off"
                                defaultValue={phoneNumber.current}
                                onChange={(e) => (phoneNumber.current = e.target.value)}
                                className="w-full p-5 pl-9 h-11 text-white text-sm font-medium border-2 border-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-700 focus:ring-offset-2 focus:ring-offset-black"
                            />
                            <Phone className="w-4 h-4 absolute left-3 top-[14px] text-muted-foreground" />
                        </motion.div>
                        <p
                            ref={error}
                            className="absolute left-0 top-[-1.5rem] font-medium text-xs text-red-600"
                        ></p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
                        className="h-full flex items-center shadow-md rounded-lg"
                    >
                        <Button
                            type="button"
                            disabled={loading || qr ? true : false}
                            onClick={
                                (loading || qr ? true : false) ? () => { } : handleGetStarted
                            }
                            className="h-11 w-full sm:w-44 text-center cursor-pointer disabled:cursor-not-allowed shadow-none bg-muted hover:bg-muted dark:bg-muted dark:hover:bg-muted text-foreground"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <p>Processing</p>
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Link className="w-5 h-5" />
                                    <p>Get Started</p>
                                </span>
                            )}
                        </Button>
                    </motion.div>
                </div>
            </div>

            {/* Right Side */}
            <div className="relative flex items-center justify-center md:justify-end h-[300px] w-full md:w-1/2">
                {!qr ? (
                    <motion.img
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
                        className="w-40 sm:w-52 md:w-64 transform scale-x-[-1]"
                        src={student}
                        alt="Student illustration"
                    />
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: -30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
                        className="flex flex-col items-center justify-end gap-5 self-center scale-80 md:scale-90"
                    >
                        <p className="font-semibold text-base text-white">
                            Scan this QR code
                        </p>
                        <div className="p-4 bg-white rounded-lg">
                            <QRCode value={qr} />
                        </div>
                        <p className="w-72 flex items-center gap-2 relative font-medium text-white text-sm italic">
                            <span className="self-start">→</span>
                            If you are scanning with a different phone number, your WhatsApp
                            will be linked but access will be denied from report buddy.
                        </p>
                    </motion.div>
                )}
            </div>

            {/* Select group modal */}
            <SelectGroupModal open={open} setOpen={setOpen} groups={groups} />
        </div>
    );
}

export default GetStarted;
