import API_END_POINTS from "@/constants/api-endpoints";
import { useAuth } from "@/context/auth-context";
import { useNotification } from "@/context/notification-context";
import { cn } from "@/lib/utils";
import { patchData } from "@/service/api-service";
import type { IBatch } from "@/types/batch";
import { errorHandler } from "@/utils/error-handler";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import { useEffect } from "react";

// Interface for Props
interface PropsType {
    batch: IBatch;
    reportInfo: { taskType: string | null; taskTopic: string | null };
}

// Save information
export default function SaveInformation({ batch, reportInfo }: PropsType) {
    // Query client
    const queryClient = useQueryClient();

    // Notificaion context
    const { notify } = useNotification();

    // Auth context
    const { setConnection, clearAuth } = useAuth();

    // Handle save
    const handleSave = () => {
        if (reportInfo.taskType && reportInfo.taskTopic) {
            mutate({
                taskType: reportInfo.taskType,
                taskTopic: reportInfo.taskTopic,
            });
        }
    };

    // useMutation for updating report information
    const { mutate, isPending, error } = useMutation({
        mutationKey: ["save-report-information"],
        mutationFn: async (payload: { taskType: string; taskTopic: string }) => {
            // Send request
            const resp = await patchData(
                API_END_POINTS.REPORT +
                `?batchId=${batch._id}&coordinatorId=${batch.coordinatorId}&groupId=${batch.groupId}`,
                payload
            );

            // Success response
            if (resp && resp.status === 200) {
                return resp.data?.data;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["report"] });
            notify("Task information updated successfully 👏");
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
        <div
            onClick={
                reportInfo.taskTopic && reportInfo.taskType ? handleSave : undefined
            }
            className="p-2  cursor-pointer"
        >
            {isPending ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
                <Save
                    className={cn(
                        "w-4 h-4 text-white",
                        !(reportInfo.taskType && reportInfo.taskTopic) &&
                        "opacity-50 cursor-not-allowed"
                    )}
                />
            )}
        </div>
    );
}
