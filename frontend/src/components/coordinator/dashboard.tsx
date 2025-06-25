import API_END_POINTS from "@/constants/api-endpoints";
import { useNotification } from "@/context/notification-context";
import { fetchData } from "@/service/api-service";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Calendar,
    Dot,
    FileText,
    Pencil,
    RotateCw,
    Settings2,
    UsersRound,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { Button } from "../ui/button";
import { useAuth } from "@/context/auth-context";
import robo from "@/assets/images/student.png";
import Loader from "../common/loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import Users from "./users";
import Settings from "./settings";
import EditBatchModal from "./modal-edit-batch";

// Dashboard coordinator
function DashboardCoordinator() {
    // Params
    const params = useParams();
    const phoneNumber = params.phoneNumber;
    const groupId = params.groupId;

    const reloadRef = useRef<HTMLParagraphElement>(null);

    // Query client
    const queryClient = useQueryClient();

    // Auth context
    const { setPhoneNumber, setConnection, setGroupId } = useAuth();

    // Notification context
    const { setNotification } = useNotification();

    const notify = (msg: string) =>
        setNotification({ id: Date.now().toString(), message: msg });

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

            notify("You are not authorized to access this page 🚫");

            return false;
        }
        return true;
    };

    // useQuery for fetching batch info
    const { data, error, isLoading } = useQuery({
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
        refetchOnWindowFocus: () => {
            if (checkAuth()) return true;
            return false;
        },
        retry: false,
    });

    // Handle error
    useEffect(() => {
        if (error) {
            console.log(error);

            if ((error as any).status === 403) {
                notify("Connection to Report Buddy is lost ⛓️‍💥");

                localStorage.removeItem("connection");
                setConnection(false);
            } else if (
                (error as any).status === 401 ||
                (error as any).status === 404
            ) {
                notify("You are not authorized to access this page 🚫");

                clearAuth();
            }
        }
    }, [error]);

    // Clean up
    useEffect(() => {
        return () => {
            queryClient.removeQueries({ queryKey: ["batch"] });
        };
    }, []);

    return (
        <div className="h-full w-full flex items-center overflow-hidden">
            {/* Loader */}
            {isLoading && (
                <div className="w-full h-full flex items-center justify-center p-5">
                    <Loader />
                </div>
            )}

            {/* Errors */}
            {error && (error as any).status !== 403 && (
                <div className="w-full h-full flex flex-col gap-3 items-center justify-center text-white p-5">
                    <img className="w-24" src={robo} alt="" />
                    <p className="font-medium text-center text-lg italic">
                        "Something went wrong, please try again later!"
                    </p>
                    <Button
                        onClick={() => {
                            if (reloadRef.current) {
                                reloadRef.current.style.rotate = "360deg";
                                reloadRef.current.style.transition = "0.5s";
                            }
                            setTimeout(() => {
                                window.location.reload();
                            }, 500);
                        }}
                        type="button"
                        className="h-11 w-full sm:w-44 text-center cursor-pointer disabled:cursor-not-allowed shadow-none 
                        bg-transparent hover:bg-transparent text-white"
                    >
                        <span className="flex items-center gap-2">
                            <p ref={reloadRef}>
                                <RotateCw className="w-5 h-5" />
                            </p>
                            <p>Reload</p>
                        </span>
                    </Button>
                </div>
            )}

            {/* Dashboard */}
            {!error && data && (
                <div className="w-full max-w-6xl mx-auto h-full flex flex-col gap-5 p-5 sm:p-10 overflow-auto no-scrollbar">
                    {/* Header */}
                    <div className="relative w-full h-fit p-5 flex flex-col gap-2 bg-my-bg-light rounded-2xl shadow">
                        {/* Batch name */}
                        <div className="flex justify-between">
                            <h1 className="text-lg sm:text-2xl font-extrabold text-white tracking-wide">
                                <span className="text-yellow-600 text-2xl sm:text-3xl">
                                    {data.batchName}
                                </span>{" "}
                                Communication batch
                            </h1>

                            {/* Modal */}
                            <EditBatchModal
                                children={
                                    <div className="self-start p-2 rounded-full hover:bg-zinc-800 text-white cursor-pointer">
                                        <Pencil className="w-4 h-4" />
                                    </div>
                                }
                                batchName={data.batchName}
                                clearAuth={clearAuth}
                                checkAuth={checkAuth}
                            />
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

                    {/* Tabs */}
                    <Tabs defaultValue="users" className="w-full">
                        <TabsList className="bg-my-bg-light text-white p-2 py-6">
                            <TabsTrigger
                                className="text-white px-4 py-4 cursor-pointer"
                                value="users"
                            >
                                <UsersRound /> Users
                            </TabsTrigger>

                            <TabsTrigger
                                className="text-white px-4 py-4 cursor-pointer"
                                value="reports"
                            >
                                <FileText /> Reports
                            </TabsTrigger>

                            <TabsTrigger
                                className="text-white px-4 py-4 cursor-pointer"
                                value="settings"
                            >
                                <Settings2 /> Settings
                            </TabsTrigger>
                        </TabsList>

                        {/* Users side */}
                        <TabsContent value="users" className="flex flex-col gap-5">
                            <Users data={data} />
                        </TabsContent>

                        {/* Reports */}
                        <TabsContent value="reports"></TabsContent>

                        {/* Settings */}
                        <TabsContent value="settings">
                            <Settings data={data} />
                        </TabsContent>
                    </Tabs>
                </div>
            )}
        </div>
    );
}

export default DashboardCoordinator;
