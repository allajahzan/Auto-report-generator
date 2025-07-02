import { API_END_POINTS } from "@/constants/apiEndpoints";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { patchData } from "@/service/apiService";
import type { IBatch } from "@/types/IBatch";
import { errorHandler } from "@/utils/errorHandler";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import type { IAttendence } from "@/types/IAttendence";
import { ToolTip } from "@/components/common/ToolTip";

// Interface for Props
interface PropsType {
    batch: IBatch;
    selectedStudents: IAttendence[];
}

// Save attendence
export function SaveAttendence({ batch, selectedStudents }: PropsType) {
    // Query client
    const queryClient = useQueryClient();

    // Notificaion context
    const { notify } = useNotification();

    // Auth context
    const { setConnection, clearAuth } = useAuth();

    // Handle save
    const handleSave = () => {
        console.log("sd");

        let students = batch.participants.filter((p) => p.role === "Student");
        let taskReport: IAttendence[] = [];

        for (let i = 0; i < students.length; i++) {
            if (selectedStudents[i]?.id === students[i].id) {
                taskReport.push({
                    id: students[i].id,
                    name: students[i].name,
                    phoneNumber: students[i].phoneNumber,
                    isCompleted: true,
                });
            } else {
                taskReport.push({
                    id: students[i].id,
                    name: students[i].name,
                    phoneNumber: students[i].phoneNumber,
                    isCompleted: false,
                });
            }
        }

        mutate(taskReport);
    };

    // useMutation for updating report information
    const { mutate, isPending, error } = useMutation({
        mutationKey: ["save-report-attendence"],
        mutationFn: async (payload: IAttendence[]) => {
            // Send request
            const resp = await patchData(
                API_END_POINTS.ATTENDENCE +
                `?batchId=${batch._id}&coordinatorId=${batch.coordinatorId}&groupId=${batch.groupId}`,
                { taskReport: payload }
            );

            // Success response
            if (resp && resp.status === 200) {
                return resp.data?.data;
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["report"] });
            notify("Task attendance has been updated successfully 👏");
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
        <ToolTip
            children={
                <div onClick={handleSave} className="p-2  cursor-pointer">
                    {isPending ? (
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                    ) : (
                        <Save className={cn("w-4 h-4 text-white")} />
                    )}
                </div>
            }
            text="Save task attendence"
        />
    );
}
