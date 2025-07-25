import { API_END_POINTS } from "@/constants/apiEndpoints";
import { useNotification } from "@/context/NotificationContext";
import { fetchData } from "@/service/apiService";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Calendar,
    Dot,
    FileText,
    Link,
    Pencil,
    Settings2,
    UsersRound,
} from "lucide-react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import robo from "@/assets/images/student.png";
import { Loader } from "@/components/common/Loader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users } from "./users/Users";
import { Settings } from "./settings/Settings";
import { Reports } from "./reports/Reports";
import { ModalEditBatch } from "./ModalEditBatch";
import { errorHandler } from "@/utils/errorHandler";
import { ToolTip } from "@/components/common/ToolTip";

// Dashboard
export function Dashboard() {
    // Params
    const params = useParams();
    const phoneNumber = params.phoneNumber;
    const groupId = params.groupId;

    // Query client
    const queryClient = useQueryClient();

    // Auth context
    const { setConnection, checkAuth, clearAuth } = useAuth();

    // Notification context
    const { notify } = useNotification();

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
            errorHandler(error, notify, setConnection, clearAuth);
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
                        onClick={() => clearAuth()}
                        type="button"
                        className="h-11 w-full sm:w-44 text-center cursor-pointer disabled:cursor-not-allowed shadow-none 
                        bg-transparent hover:bg-transparent text-white"
                    >
                        <span className="flex items-center gap-2">
                            <p>
                                <Link className="w-5 h-5" />
                            </p>
                            <p>Go Connect Again</p>
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
                            <h1 className="text-white">
                                <span className="text-white text-2xl sm:text-3xl font-extrabold tracking-wider">
                                    {data.batchName.toUpperCase()}
                                </span>{" "}
                                <span className="text-base font-medium italic">
                                    communication batch
                                </span>
                            </h1>

                            {/* Modal */}
                            <ModalEditBatch
                                children={
                                    <ToolTip
                                        children={
                                            <div className="self-start p-2 rounded-full hover:bg-zinc-800 text-white cursor-pointer">
                                                <Pencil className="w-4 h-4" />
                                            </div>
                                        }
                                        text="Update batch name"
                                    />
                                }
                                batchName={data.batchName}
                            />
                        </div>

                        {/* Date and paricipants count */}
                        <div className="flex items-center text-white font-medium text-sm">
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
                        <TabsList className="bg-my-bg-light text-white p-2 py-6 w-full sm:w-fit">
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
                                <FileText /> Report
                            </TabsTrigger>

                            <TabsTrigger
                                className="text-white px-4 py-4 cursor-pointer"
                                value="settings"
                            >
                                <Settings2 /> Settings
                            </TabsTrigger>
                        </TabsList>

                        {/* Users side */}
                        <TabsContent value="users" className="flex flex-col gap-2">
                            <Users data={data} />
                        </TabsContent>

                        {/* Reports */}
                        <TabsContent value="reports" className="flex flex-col gap-2">
                            <Reports data={data} />
                        </TabsContent>

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
