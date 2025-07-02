import { API_END_POINTS } from "@/constants/apiEndpoints";
import { fetchData } from "@/service/apiService";
import type { IBatch } from "@/types/IBatch";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, ListTodo, ReceiptText, ScanEye } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NameCard } from "@/components/common/NameCard";
import { cn } from "@/lib/utils";
import { errorHandler } from "@/utils/errorHandler";
import { useNotification } from "@/context/NotificationContext";
import { useAuth } from "@/context/AuthContext";
import { Loader } from "@/components/common/Loader";
import { SaveInformation } from "./SaveInformation";
import { SaveAttendence } from "./SaveAttendence";
import { NotFound } from "@/components/common/NotFound";
import type { IAttendence } from "@/types/IAttendence";

// Interface for Props
interface PropsType {
    data: IBatch;
}

// Reports
export function Reports({ data: batch }: PropsType) {
    // Selected students
    const [selectedStudents, setSelectedStudents] = useState<IAttendence[]>([]);

    // Selected task
    const [task, setTask] = useState<string>("");

    // Selected topic
    const [topic, setTopic] = useState<string>("");

    // Report details
    const trainer =
        batch.participants.find((p) => p.role === "Trainer")?.name || "Unknown";
    const coordinator =
        batch.participants.find((p) => p.phoneNumber === batch.coordinatorId)
            ?.name || "Unknown";

    // Query client
    const queryClient = useQueryClient();

    // Notification context
    const { notify } = useNotification();

    // Auth context
    const { setConnection, clearAuth } = useAuth();

    // Toggle student selection
    const toggleStudentSelection = (studentJson: string) => {
        const student = JSON.parse(studentJson); 

        setSelectedStudents((prev) => {
            const isAlreadySelected = prev.some((s) => s.id === student.id);

            if (isAlreadySelected) {
                // Deselect
                return prev.filter((s) => s.id !== student.id);
            } else {
                // Select
                return [...prev, student];
            }
        });
    };

    // useQuery for fetching reports
    const { data, error, isLoading, refetch } = useQuery({
        queryKey: ["report"],
        queryFn: async () => {
            const resp = await fetchData(
                API_END_POINTS.REPORT +
                `?batchId=${batch._id}&coordinatorId=${batch.coordinatorId}&groupId=${batch.groupId}`
            );

            if (resp && resp.status === 200) {
                return resp.data?.data || "";
            }
        },
        retry: false,
    });

    // Handle error
    useEffect(() => {
        if (error) {
            errorHandler(error, notify, setConnection, clearAuth);
        }
    }, [error]);

    // Set selected students
    useEffect(() => {
        if (data) {
            setSelectedStudents(
                data.taskReport
                    .filter((sr: IAttendence) => sr.isCompleted)
                    .map((sr: IAttendence) => {
                        return {
                            id: sr.id,
                            name: sr.name,
                            phoneNumber: sr.phoneNumber,
                            isCompleted: sr.isCompleted,
                        };
                    })
            );

            setTask(data?.taskType || "");
            setTopic(data?.taskTopic || "");
        } else {
            setSelectedStudents([]);
            setTask("");
            setTopic("");
        }
    }, [data, batch]);

    // Fetch report
    useEffect(() => {
        refetch();

        // Clean up
        return () => {
            queryClient.removeQueries({ queryKey: ["report"] });
        };
    }, [batch]);

    return (
        <>
            {isLoading && (
                <div className="h-[265px] w-full flex items-center justify-center">
                    <Loader />
                </div>
            )}
            {!isLoading && (
                <>
                    <div className="relative w-full h-fit p-5 flex flex-col gap-5 bg-my-bg-light rounded-2xl shadow">
                        {/* Title */}
                        <div className="flex justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-full bg-zinc-800 text-white cursor-pointer">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <h1 className="text-lg font-extrabold text-white tracking-wide">
                                    Task Information
                                </h1>
                            </div>

                            {/* Save */}
                            <SaveInformation
                                batch={batch}
                                reportInfo={{
                                    taskType: task,
                                    taskTopic: topic,
                                }}
                            />
                        </div>

                        {/* Report form */}
                        <form className="flex flex-col gap-2">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="taskType"
                                        className="text-xs text-white font-medium"
                                    >
                                        Task Type
                                    </Label>
                                    <Select
                                        value={task || data?.taskType || ""}
                                        onValueChange={(value) => setTask(value)}
                                    >
                                        <SelectTrigger
                                            id="taskType"
                                            className="relative w-full text-white text-sm font-medium p-5 pl-9 
                                border border-zinc-800 hover:border-zinc-600 hover:bg-my-bg-light cursor-pointer"
                                        >
                                            <SelectValue placeholder="Select a type" />
                                            <ListTodo className="w-4 h-4 absolute left-3 top-[13px] text-muted-foreground" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-my-bg-light border border-zinc-800 text-white">
                                            <SelectItem value="Audio">Audio</SelectItem>
                                            <SelectItem value="Writing">Writing</SelectItem>
                                            <SelectItem value="Listening">Listening</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    {/* Error */}
                                    {/* <ValidationError error={errors.pnumber?.message || ""} /> */}
                                </div>

                                <div className="space-y-2">
                                    <Label
                                        htmlFor="taskTopic"
                                        className="text-xs text-white font-medium"
                                    >
                                        Topic
                                    </Label>
                                    <div className="relative flex-1">
                                        <Input
                                            id="taskTopic"
                                            tabIndex={-1}
                                            autoComplete="off"
                                            value={topic || ""}
                                            onChange={(e) => setTopic(e.target.value)}
                                            placeholder={`Enter topic`}
                                            className="text-white text-sm font-medium p-5 pl-9 border border-zinc-800 hover:border-zinc-600 hover:bg-my-bg-light"
                                        />
                                        <ReceiptText className="w-4 h-4 absolute left-3 top-[13px] text-muted-foreground" />
                                    </div>

                                    {/* Error */}
                                    {/* <ValidationError error={errors.pnumber?.message || ""} /> */}
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Attendence */}
                    <div className="relative w-full h-full p-5 flex flex-col gap-5 bg-my-bg-light rounded-2xl shadow">
                        <div className="flex justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-2 rounded-full bg-zinc-800 text-white cursor-pointer">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <h1 className="text-lg font-extrabold text-white tracking-wide">
                                    Task Attendence
                                </h1>
                            </div>

                            {/* Save attendence */}
                            <SaveAttendence
                                batch={batch}
                                selectedStudents={selectedStudents}
                            />
                        </div>

                        {/* Students */}
                        {batch?.participants.filter((p) => p.role === "Student").length >
                            0 && (
                                <div className="space-y-2">
                                    <Label
                                        htmlFor="students"
                                        className="text-xs text-white font-medium"
                                    >
                                        Select students who completed the task
                                    </Label>

                                    {/* Hidden input */}
                                    <input id="students" className="hidden" />

                                    <div
                                        id="students"
                                        className="grid grid-cols-1 md:grid-cols-2 gap-3"
                                    >
                                        {batch.participants
                                            .filter((p) => p.role === "Student")
                                            .map((p, index) => {
                                                const isSelected = selectedStudents.some(
                                                    (s) => s.id === p.id
                                                );

                                                return (
                                                    <div
                                                        key={index}
                                                        onClick={() =>
                                                            toggleStudentSelection(
                                                                JSON.stringify({
                                                                    id: p.id,
                                                                    name: p.name,
                                                                    phoneNumber: p.phoneNumber,
                                                                    isCompleted: isSelected,
                                                                })
                                                            )
                                                        }
                                                        className={cn(
                                                            "flex flex-col gap-5 p-3 border border-transparent rounded-lg shadow bg-my-bg-dark cursor-pointer",
                                                            isSelected
                                                                ? "border-2 border-green-800 bg-green-900/20"
                                                                : "border-2 border-transparent"
                                                        )}
                                                    >
                                                        <NameCard
                                                            data={{
                                                                id: p.id,
                                                                name: p.name,
                                                                profilePic: p.profilePic,
                                                                role: p.role,
                                                                phoneNumber: p.phoneNumber,
                                                            }}
                                                            showRole={false}
                                                            isMoreOption={false}
                                                        />
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            )}

                        {/* If not students */}
                        {batch?.participants.filter((p) => p.role === "Student").length ===
                            0 && <NotFound message="No students found" />}
                    </div>

                    {/* Previews */}
                    {data && (
                        <div className="relative w-full h-fit p-5 flex flex-col gap-5 bg-my-bg-light rounded-2xl shadow">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-full bg-zinc-800 text-white cursor-pointer">
                                        <ScanEye className="w-4 h-4" />
                                    </div>
                                    <h1 className="text-lg font-extrabold text-white tracking-wide">
                                        Preview
                                    </h1>
                                </div>

                                {/* <div
                                    onClick={handleCopy}
                                    className="p-2 text-white cursor-pointer"
                                >
                                    <Copy className="w-4 h-4" />
                                </div> */}
                            </div>

                            {/*  */}
                            <div className="flex flex-col text-sm text-white font-mediums font-mono">
                                <p>
                                    {data?.taskType
                                        ? `${data?.taskType} task report`
                                        : "Daily task report"}
                                </p>
                                <p>🎓BATCH: {batch.batchName}</p>
                                <p>
                                    📅Date:{" "}
                                    {data?.date
                                        ? new Date(data.date).toLocaleDateString("en-GB", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                        })
                                        : new Date().toLocaleDateString("en-GB", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                        })}
                                </p>
                                <p>👨‍🏫Trainer: {trainer}</p>
                                <p>🎤Coordinator: {coordinator}</p>
                                <p>📝Topic: {data?.taskTopic || "Not mentioned"}</p>
                                <br />
                                <p>Submitted:-</p>
                                {batch.participants
                                    .filter((p) => p.role === "Student")
                                    .map((p) => {
                                        if (selectedStudents.some((s) => s.id === p.id)) {
                                            return <p key={p.id}>{p.name}:✅</p>;
                                        }
                                    })}
                                <br />
                                <p>Not submitted:-</p>
                                {batch.participants
                                    .filter((p) => p.role === "Student")
                                    .map((p) => {
                                        if (!selectedStudents.some((s) => s.id === p.id)) {
                                            return <p key={p.id}>{p.name}:❌</p>;
                                        }
                                    })}
                            </div>
                        </div>
                    )}
                </>
            )}
        </>
    );
}
