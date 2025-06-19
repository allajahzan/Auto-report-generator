import student from "@/assets/images/student.png";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Loader2, Phone, QrCode } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { CustomError } from "@/utils/error";
import { useEffect, useRef, useState } from "react";
import { BASE_URL } from "@/service/base-url";
import QRCode from "react-qr-code";
import { botStatus, getQRcode } from "@/socket/bot";

// GetStarted Component
function GetStarted() {
    console.log("re renders");

    // Phone number
    const phoneNumber = useRef<string>("");

    // QR code
    const [qr, setQr] = useState<string>("");

    const [loading, setLoading] = useState<boolean>(false);

    // Get Started
    const { isLoading, error, isError, refetch } = useQuery({
        queryKey: ["gr-code"],
        queryFn: async () => {
            setLoading(true);

            const resp = await fetch(
                `${BASE_URL}/qr-code?phoneNumber=${phoneNumber.current}`,
                {
                    method: "GET",
                }
            );

            if (!resp.ok) {
                throw new CustomError(resp.statusText, resp.status);
            }

            return await resp.json();
        },
        retry: false,
        enabled: false,
        refetchOnWindowFocus: false,
        staleTime: 0,
    });

    // Handle get started
    const handleGetStarted = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!phoneNumber) {
            alert("Enter phone number");
            return;
        }

        refetch();
    };

    useEffect(() => {
        if (isError && !isLoading) {
            setLoading(false);

            if (error instanceof CustomError) {
                console.log(error.message, error.status);
            } else {
                console.log((error as Error).message);
            }
        }
    }, [isError, isLoading, setLoading]);

    // Get qr code
    useEffect(() => {
        if (!isError) {
            try {
                getQRcode((qrCode: string) => {
                    setQr(qrCode);
                    setLoading(false);
                });
            } catch (err: unknown) {
                console.log(err);
            }
        }
    }, [isError]);

    // Bot connection
    useEffect(() => {
        try {
            botStatus((status) => {
                if (status === "connected") {
                    console.log("Bot is connected");
                } else if (status === "disconnected") {
                    console.log("Bot is disconnected");
                } else if (status === "expired") {
                    console.log("qr expired");
                } else {
                    console.log("Bot is reconnecting");
                }

                setQr("");
                setLoading(false);
            });
        } catch (err: unknown) {
            console.log(err);
        }
    }, []);

    return (
        <div className="w-full max-w-6xl mx-auto h-full flex flex-col md:flex-row items-center justify-center gap-10 p-5 md:p-10">
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

                <form
                    onSubmit={handleGetStarted}
                    className="flex flex-col sm:flex-row gap-3 mt-6 w-full max-w-md"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
                        className="relative shadow-md rounded-lg w-full"
                    >
                        <Input
                            id="work"
                            type="text"
                            placeholder="Enter mobile number"
                            autoComplete="off"
                            defaultValue={phoneNumber.current}
                            onChange={(e) => (phoneNumber.current = e.target.value)}
                            className="w-full p-5 pl-9 h-11 text-white font-medium dark:border-customBorder-dark focus:outline-none focus:ring-2 focus:ring-zinc-300 focus:ring-offset-2 focus:ring-offset-black"
                        />
                        <Phone className="w-4 h-4 absolute left-3 top-[14px] text-muted-foreground" />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
                        className="h-full flex items-center shadow-md rounded-lg"
                    >
                        <Button
                            type="submit"
                            disabled={loading}
                            className="h-11 w-full sm:w-44 text-center cursor-pointer disabled:cursor-not-allowed shadow-none bg-muted hover:bg-muted dark:bg-muted dark:hover:bg-muted text-foreground"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <p>Processing</p>
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <QrCode className="w-5 h-5" />
                                    <p>Get Started</p>
                                </span>
                            )}
                        </Button>
                    </motion.div>
                </form>
            </div>

            {/* Right Side */}
            <div className="flex items-center justify-center md:justify-end h-[300px] w-full md:w-1/2">
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
                    <div className="flex items-center justify-center p-4 bg-white">
                        <QRCode value={qr} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default GetStarted;
