import API_END_POINTS from "@/constants/api-endpoints";
import { useNotification } from "@/context/notification-context";
import { fetchData } from "@/service/api-service";
import { useQuery } from "@tanstack/react-query";
import {
    Calendar,
    Dot,
    Loader2,
    LogOut,
    Pencil,
    UserRound,
    UsersRound,
} from "lucide-react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "../ui/button";
import { useAuth } from "@/context/auth-context";
import NameCard from "../common/name-card";

// Dashboard coordinator
function DashboardCoordinator() {
    // Params
    const params = useParams();
    const phoneNumber = params.phoneNumber;
    const groupId = params.groupId;

    // Auth context
    const { setConnection } = useAuth();

    // Notification context
    const { setNotification } = useNotification();

    const { data, error, isError, isLoading } = useQuery({
        queryKey: ["batch"],
        queryFn: async () => {
            // Send request
            const resp = await fetchData(
                API_END_POINTS.BATCH +
                `?groupId=${groupId}&coordinatorId=${phoneNumber}`
            );

            // Success response
            if (resp && resp.status === 200) {
                return resp.data?.data;
            }
        },
        refetchOnWindowFocus: false,
        retry: false,
    });

    useEffect(() => {
        if (isError) {
            if ((error as any).status === 403) {
                setNotification({
                    id: Date.now().toString(),
                    message: "Connection to report buddy is lost ⛓️‍💥",
                });
            } else {
                setNotification({
                    id: Date.now().toString(),
                    message: "Something went wrong, please try again 😵",
                });
            }
        }
    }, [isError]);

    if (data) {
        console.log(data);
    }

    return (
        <div className="h-full w-full overflow-hidden">
            {isLoading && (
                <div className="h-full flex items-center justify-center p-5">
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                </div>
            )}
            {isError && (error as any).status === 403 && (
                <div className="h-full flex items-center justify-center p-5">
                    <Button
                        onClick={() => {
                            localStorage.removeItem("connection");
                            setConnection(false);
                        }}
                        type="button"
                        className="h-11 w-full sm:w-44 text-center cursor-pointer disabled:cursor-not-allowed shadow-none bg-muted hover:bg-muted dark:bg-muted dark:hover:bg-muted text-foreground"
                    >
                        {false ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <p>Processing</p>
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <LogOut className="w-5 h-5" />
                                <p>Logout</p>
                            </span>
                        )}
                    </Button>
                </div>
            )}

            {isError && (error as any).status !== 403 && (
                <div className="h-full flex items-center justify-center text-white p-5">
                    {/* <img src={bot} alt="" /> */}
                    <p className="font-medium text-center text-xl">
                        Something went wrong, please try again later 😵
                    </p>
                </div>
            )}

            {data && (
                <div className="w-full max-w-6xl mx-auto h-full flex flex-col gap-5 p-5 sm:p-10 overflow-auto no-scrollbar">
                    {/* Header */}
                    <div className=" relative w-full h-fit p-5 flex flex-col gap-2 bg-my-bg-light rounded-2xl shadow">
                        {/* Batch name */}
                        <div className="flex justify-between">
                            <h1 className="text-2xl font-extrabold text-white tracking-wide">
                                <span className="text-white text-4xl">
                                    {data.batchName || '"Batch Name"'}
                                </span>{" "}
                                Communication batch
                            </h1>

                            <div className="self-start p-2 rounded-full hover:bg-zinc-800 text-white cursor-pointer">
                                <Pencil className="w-4 h-4" />
                            </div>
                        </div>

                        {/* Date and paricipants count */}
                        <div className="flex items-center text-white italic font-medium text-sm">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>
                                    {new Date().toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })}
                                </span>
                            </div>
                            <Dot className="w-8 h-8" />
                            <div className="flex items-center gap-2">
                                <UsersRound className="w-4 h-4 text-white" />
                                <span>{data.participants.length} Participants</span>
                            </div>
                        </div>
                    </div>

                    {/* Coordinator */}
                    <div className=" relative w-full h-fit p-5 flex flex-col gap-5 bg-my-bg-light rounded-2xl shadow">
                        {/* Title */}
                        <div className="flex justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-full bg-zinc-800 text-white cursor-pointer">
                                    <UserRound className="w-4 h-4" />
                                </div>
                                <h1 className="text-lg font-extrabold text-white tracking-wide">
                                    Batch Coordinator
                                </h1>
                            </div>

                            <div className="p-2 rounded-full hover:bg-zinc-800 text-white cursor-pointer">
                                <Pencil className="w-4 h-4" />
                            </div>
                        </div>

                        {/* Name and details */}
                        <div className="flex flex-col gap-5 p-3 bg-my-bg-dark rounded-lg shadow">
                            <NameCard
                                data={{
                                    id: "asd",
                                    name: "",
                                    profilePic: "",
                                    phoneNumber: "7034661353",
                                }}
                            />
                        </div>
                    </div>

                    {/* Participants */}
                    <div className=" relative w-full h-fit p-5 flex flex-col gap-5 bg-my-bg-light rounded-2xl shadow">
                        {/* Title */}
                        <div className="flex justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-full bg-zinc-800 text-white cursor-pointer">
                                    <UserRound className="w-4 h-4" />
                                </div>
                                <h1 className="text-lg font-extrabold text-white tracking-wide">
                                    Participants
                                </h1>
                            </div>

                            <div className="p-2 rounded-full hover:bg-zinc-800 text-white cursor-pointer">
                                <Pencil className="w-4 h-4" />
                            </div>
                        </div>

                        {/* Name and details */}

                        <div className="flex flex-col gap-2">
                            {data.participants.map((p: any) => (
                                <div className="p-3 bg-my-bg-dark rounded-lg shadow">
                                    <NameCard key={p.id} data={p} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DashboardCoordinator;
