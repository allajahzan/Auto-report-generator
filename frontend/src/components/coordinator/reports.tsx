import API_END_POINTS from "@/constants/api-endpoints";
import { fetchData } from "@/service/api-service";
import type { IBatch } from "@/types/batch";
import { useQuery } from "@tanstack/react-query";
import {
    FileText,
    ListTodo,
    Menu,
    ReceiptText,
    ScanEye,
    Send,
} from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import NameCard from "../common/name-card";
import type { IParticipant } from "../auth/modal-select-group";
import { cn } from "@/lib/utils";

// Interface for Props
interface PropsType {
    data: IBatch;
}

// Interface for participant
interface IAttendence {
    id: string;
    name: string;
    phoneNumber: string;
    isCompleted: boolean;
}

// Reports Component
function Reports({ data: batch }: PropsType) {
    // Selected students
    const [selectedStudents, setSelectedStudents] = useState<IAttendence[]>([]);

    // Toggle student selection
    const toggleStudentSelection = (studentJson: string) => {
        const student = JSON.parse(studentJson); // convert to object

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

    // Send report
    const handleSend = () => { };

    // useQuery for fetching reports
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["report"],
        queryFn: async () => {
            const resp = await fetchData(
                API_END_POINTS.REPORT +
                `?batchId=${batch._id}&coordinatorId=${batch.coordinatorId}`
            );

            if (resp && resp.status === 200) {
                return resp.data?.data;
            }
        },
        retry: false,
    });

    useEffect(() => {
        refetch();
    }, [batch]);

    return (
        <>
            <div className="relative w-full h-fit p-5 flex flex-col gap-5 bg-my-bg-light rounded-2xl shadow">
                {/* Title */}
                <div className="flex justify-between">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-full bg-zinc-800 text-white cursor-pointer">
                            <FileText className="w-4 h-4" />
                        </div>
                        <h1 className="text-lg font-extrabold text-white tracking-wide">
                            Reports
                        </h1>
                    </div>

                    <div className="hidden absolute right-5 top-5">
                        <Select defaultValue={data?.taskType || "daily-task-report"}>
                            <SelectTrigger
                                id="role"
                                className="relative text-white text-sm font-medium p-5 pl-9 
                                border border-zinc-800 hover:border-zinc-600 hover:bg-my-bg-light cursor-pointer"
                            >
                                <SelectValue placeholder="Select a report" />
                                <Menu className="w-4 h-4 absolute left-3 top-[13px] text-muted-foreground" />
                            </SelectTrigger>
                            <SelectContent className="bg-my-bg-light border border-zinc-800 text-white">
                                <SelectItem value="daily-task-report">
                                    Daily Task Report
                                </SelectItem>
                                <SelectItem value="session-report">Sesson Report</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
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
                            // defaultValue={prole}
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
                                    // {...register("pnumber")}
                                    placeholder={`Enter topic`}
                                    className="text-white text-sm font-medium p-5 pl-9 border border-zinc-800 hover:border-zinc-600 hover:bg-my-bg-light"
                                />
                                <ReceiptText className="w-4 h-4 absolute left-3 top-[13px] text-muted-foreground" />
                            </div>

                            {/* Error */}
                            {/* <ValidationError error={errors.pnumber?.message || ""} /> */}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label
                            htmlFor="students"
                            className="text-xs text-white font-medium"
                        >
                            Students
                        </Label>

                        {batch?.participants.length > 0 && (
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
                                                    isSelected ? "border border-white" : ""
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
                        )}
                    </div>
                </form>
            </div>

            {/* Previews */}
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

                    <div onClick={handleSend} className="p-2 text-white cursor-pointer">
                        <Send className="w-4 h-4" />
                    </div>
                </div>

                {/*  */}
                <div className="flex flex-col text-sm text-white font-mediums font-mono">
                    <p>Audio task report || Task report</p>
                    <p>🎓BATCH: {batch.batchName}</p>
                    <p>📅Date: {new Date().toLocaleDateString()}</p>
                    <p>
                        👨‍🏫Trainer:{" "}
                        {(
                            batch.participants.find(
                                (p) => p.role === "Trainer"
                            ) as IParticipant
                        )?.name || "Unknown"}
                    </p>
                    <p>
                        🎤Coordinator:{" "}
                        {(
                            batch.participants.find(
                                (p) => p.phoneNumber === batch.coordinatorId
                            ) as IParticipant
                        )?.name || "Unknown"}
                    </p>
                    <p>📝Topic: {"asdf"}</p>
                    <br />
                    <p>Submitted:-</p>
                    {batch.participants.map((p) => {
                        if (selectedStudents.find((s) => s.id === p.id))
                            return <p>{p.name}:✅</p>;
                    })}
                    <br />
                    <p>Not submitted:-</p>
                    {batch.participants.map((p) => {
                        if (!selectedStudents.find((s) => s.id === p.id))
                            return <p>{p.name}:❌</p>;
                    })}
                </div>
            </div>
        </>
    );
}

export default Reports;
