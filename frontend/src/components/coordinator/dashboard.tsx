import API_END_POINTS from "@/constants/api-endpoints";
import { useNotification } from "@/context/notification-context";
import { fetchData } from "@/service/api-service";
import { useQuery } from "@tanstack/react-query";
import {
    Calendar,
    ChevronLeft,
    Dot,
    Pencil,
    UserRound,
    UsersRound,
} from "lucide-react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "../ui/button";
import { useAuth } from "@/context/auth-context";
import NameCard from "../common/name-card";
import robo from "@/assets/images/student.png";
import Loader from "../common/loader";

// Dashboard coordinator
function DashboardCoordinator() {
    // Params
    const params = useParams();
    const phoneNumber = params.phoneNumber;
    const groupId = params.groupId;

    // Auth context
    const { setPhoneNumber, setConnection, setGroupId } = useAuth();

    // Notification context
    const { setNotification } = useNotification();

    // Clear auth
    const clearAuth = () => {
        localStorage.removeItem("phoneNumber");
        setPhoneNumber("");
        localStorage.removeItem("connection");
        setConnection(false);
        localStorage.removeItem("groupId");
        setGroupId("");
    };

    // Check auth
    const checkAuth = () => {
        const phoneNumber = localStorage.getItem("phoneNumber");
        const connection = localStorage.getItem("connection");
        const groupId = localStorage.getItem("groupId");

        if (!phoneNumber || !connection || !groupId) {
            if (!phoneNumber) setPhoneNumber("");
            if (!groupId) setGroupId("");

            localStorage.removeItem("connection");
            setConnection(false);

            setNotification({
                id: Date.now().toString(),
                message: "You are not authorized to access this page 🚫",
            });
            return false;
        }
        return true;
    };

    // useQuery for fetching batch info
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
        refetchOnWindowFocus: true,
        retry: false,
    });

    // Handle error
    useEffect(() => {
        if (error) {
            if ((error as any).status === 403) {
                setNotification({
                    id: Date.now().toString(),
                    message: "Connection to Report Buddy is lost ⛓️‍💥",
                });
            } else if (
                (error as any).status === 401 ||
                (error as any).status === 404
            ) {
                setNotification({
                    id: Date.now().toString(),
                    message: "You are not authorized to access this page 🚫",
                });

                clearAuth();
            }
        }
    }, [error]);

    return (
        <div className="h-full w-full overflow-hidden">
            {/* Loader */}
            {isLoading && (
                <div className="h-full flex items-center justify-center p-5">
                    <Loader />
                </div>
            )}

            {/* Forbidden - connection lost */}
            {isError && (error as any).status === 403 && (
                <div className="relative h-full flex flex-col items-center justify-center gap-5 p-5">
                    <img className="w-24" src={robo} alt="" />
                    <p className="font-medium text-white text-center text-lg italic relative -top-2">
                        "You have lost your connection with Report Buddy,
                        <br />
                        connect again!"
                    </p>
                    <Button
                        onClick={() => {
                            localStorage.removeItem("connection");
                            setConnection(false);
                        }}
                        type="button"
                        className="h-11 w-full sm:w-44 text-center cursor-pointer disabled:cursor-not-allowed shadow-none 
                        bg-transparent hover:bg-transparent text-white relative -top-4"
                    >
                        <span className="flex items-center gap-2">
                            <ChevronLeft className="w-5 h-5" />
                            <p>Connect</p>
                        </span>
                    </Button>
                </div>
            )}

            {/* Other errors */}
            {isError && (error as any).status !== 403 && (
                <div className="h-full flex items-center justify-center text-white p-5">
                    <p className="font-medium text-center text-lg italic">
                        "Something went wrong, please try again later!"
                    </p>
                </div>
            )}

            {/* Dashboard */}
            {data && (
                <div className="w-full max-w-6xl mx-auto h-full flex flex-col gap-5 p-5 sm:p-10 overflow-auto no-scrollbar">
                    {/* Header */}
                    <div className=" relative w-full h-fit p-5 flex flex-col gap-2 bg-my-bg-light rounded-2xl shadow">
                        {/* Batch name */}
                        <div className="flex justify-between">
                            <h1 className="text-lg sm:text-2xl font-extrabold text-white tracking-wide">
                                <span className="text-white text-2xl sm:text-3xl">
                                    {data.batchName}
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
                                data={data.participants.find(
                                    (p: any) => p.phoneNumber === data.coordinatorId
                                )}
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
                            {data.participants.map((p: any, index: number) => (
                                <div
                                    key={index}
                                    className="p-3 bg-my-bg-dark rounded-lg shadow"
                                >
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
