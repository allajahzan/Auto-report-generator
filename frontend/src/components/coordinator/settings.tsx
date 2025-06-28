import type { IBatch } from "@/types/batch";
import { Activity, FileClock, LogOut, Settings2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchData } from "@/service/api-service";
import API_END_POINTS from "@/constants/api-endpoints";
import { useParams } from "react-router-dom";
import { useAuth } from "@/context/auth-context";
import { useNotification } from "@/context/notification-context";
import { errorHandler } from "@/utils/error-handler";
import ConfirmModal from "./modal-confirm-delete";

// Interface for props
interface PropsType {
    data: IBatch;
}

// Settings Component
function Settings({ data }: PropsType) {
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

    // Handle toggle button
    const handleToggleButton = (type: "tracking" | "sharing") => {
        if (!checkAuth()) {
            return;
        }

        if (type === "tracking") {
            data.isTrackingEnabled = !data.isTrackingEnabled;
            mutate({ isTrackingEnabled: data.isTrackingEnabled });
        } else if (type === "sharing") {
            data.isSharingEnabled = !data.isSharingEnabled;
            mutate({ isSharingEnabled: data.isSharingEnabled });
        }
    };

    // useMutation for to enable/disable tracking and sharing
    const { mutate, error } = useMutation({
        mutationKey: ["enable-disable"],
        mutationFn: async (payload: {
            isTrackingEnabled?: boolean;
            isSharingEnabled?: boolean;
        }) => {
            // Send request
            const resp = await patchData(
                API_END_POINTS.BATCH +
                `?groupId=${groupId}&coordinatorId=${phoneNumber}`,
                payload
            );

            // Success response
            if (resp && resp.status === 200) {
                return resp.data?.data;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["batch"] });
        },
        onError: (error) => {
            console.log(error);
        },
        retry: false,
    });

    // Handle error
    useEffect(() => {
        if (error) {
            errorHandler(error, notify, setConnection, clearAuth);
        }
    }, [error]);

    return (
        <div className="relative w-full h-fit p-5 flex flex-col gap-5 bg-my-bg-light rounded-2xl shadow">
            {/* Title */}
            <div className="flex justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-zinc-800 text-white cursor-pointer">
                        <Settings2 className="w-4 h-4" />
                    </div>
                    <h1 className="text-lg font-extrabold text-white tracking-wide">
                        Settings
                    </h1>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                {/* Enable tracking */}
                <div className="p-3 flex items-center gap-3 bg-my-bg-dark rounded-lg shadow">
                    <div className="self-start sm:self-center p-3.5 rounded-sm bg-zinc-800 text-white">
                        <Activity className="w-5 h-5" />
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                        <h1 className="font-semibold text-sm text-white">
                            Track WhatsApp Group
                        </h1>
                        <p className="font-medium text-xs text-muted-foreground">
                            Track the selected WhatsApp group for audio task submissions.
                        </p>
                    </div>
                    <Switch
                        id="enable-tracking"
                        className="self-start sm:self-center"
                        checked={data.isTrackingEnabled}
                        onCheckedChange={() => handleToggleButton("tracking")}
                    />
                </div>

                {/* Enable schedule */}
                <div className="p-3 flex items-center gap-3 bg-my-bg-dark rounded-lg shadow">
                    <div className="self-start sm:self-center p-3.5 rounded-sm bg-zinc-800 text-white">
                        <FileClock className="w-5 h-5" />
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                        <h1 className="font-semibold text-sm text-white">
                            Share Audio Task Reports
                        </h1>
                        <p className="font-medium text-xs text-muted-foreground">
                            Automatically share audio task reports in group at scheduled
                            times.
                        </p>
                    </div>
                    <Switch
                        id="enable-sharing"
                        className="self-start sm:self-center"
                        checked={data.isSharingEnabled}
                        onCheckedChange={() => handleToggleButton("sharing")}
                    />
                </div>

                {/* Logout */}
                <div className="p-3 flex items-center gap-3 bg-my-bg-dark rounded-lg shadow">
                    <div className="self-start sm:self-center p-3.5 rounded-sm bg-red-600/20 text-red-600">
                        <LogOut className="w-5 h-5 rotate-180" />
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                        <h1 className="font-semibold text-sm text-white">Logout</h1>
                        <p className="font-medium text-xs text-muted-foreground w-full">
                            This will remove your WhatsApp account from Report Buddy.
                        </p>
                    </div>
                    <ConfirmModal
                        children={
                            <Button className="self-start sm:self-center border border-red-600 text-red-600 hover:bg-red-600/20 cursor-pointer">
                                Logout
                            </Button>
                        }
                    />
                </div>
            </div>
        </div>
    );
}

export default Settings;
