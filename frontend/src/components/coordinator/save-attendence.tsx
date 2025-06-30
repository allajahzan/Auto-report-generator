import API_END_POINTS from "@/constants/api-endpoints";
import { useAuth } from "@/context/auth-context";
import { useNotification } from "@/context/notification-context";
import { patchData } from "@/service/api-service";
import type { IBatch } from "@/types/batch";
import { errorHandler } from "@/utils/error-handler";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import { useEffect } from "react";
import type { IAttendence } from "./reports";
import { cn } from "@/lib/utils";

// Interface for Props
interface PropsType {
    batch: IBatch;
    selectedStudents: IAttendence[];
}

// Save information
function SaveAttendence({ batch, selectedStudents }: PropsType) {
    // Query client
    const queryClient = useQueryClient();

    // Notificaion context
    const { notify } = useNotification();

    // Auth context
    const { setConnection, clearAuth } = useAuth();

    // Handle save
    const handleSave = () => {
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

        if (taskReport.length === 0) return;
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
            notify("Task attendence updated successfully 👏");
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
            onClick={selectedStudents.length === 0 ? undefined : handleSave}
            className="p-2  cursor-pointer"
        >
            {isPending ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
                <Save
                    className={cn(
                        "w-4 h-4 text-white",
                        selectedStudents.length === 0 && "opacity-50 cursor-not-allowed"
                    )}
                />
            )}
        </div>
    );
}

export default SaveAttendence;
