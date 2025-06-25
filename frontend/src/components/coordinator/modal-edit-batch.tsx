import { DialogTrigger } from "@radix-ui/react-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Home, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { patchData } from "@/service/api-service";
import API_END_POINTS from "@/constants/api-endpoints";
import { useNotification } from "@/context/notification-context";
import { useParams } from "react-router-dom";
import { useAuth } from "@/context/auth-context";

// Interface for Props
interface PropsType {
    children: ReactNode;
    batchName: string;
}

// Edit batch modal Component
function EditBatchModal({ children, batchName }: PropsType) {
    // Modal states
    const [open, setOpen] = useState<boolean>(false);

    // Batch name
    const bname = useRef<string>(batchName);
    const errorp = useRef<HTMLParagraphElement>(null);

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

    // useQuery for updating batch info
    const { isLoading, error, refetch } = useQuery({
        queryKey: ["edit-batch"],
        queryFn: async () => {
            // Send request
            const resp = await patchData(
                API_END_POINTS.BATCH +
                `?groupId=${groupId}&coordinatorId=${phoneNumber}`,
                {
                    batchName: bname.current,
                }
            );

            // Success response
            if (resp && resp.status === 200) {
                setOpen(false);
                return resp.data?.data;
            }
        },
        enabled: false,
        refetchOnMount: false,
        retry: false,
    });

    // Handle submit
    const handleSubmit = async () => {
        if (!bname.current) {
            if (errorp.current) errorp.current.innerHTML = "Enter batch name";
            return;
        }

        if (errorp.current) errorp.current.innerHTML = "";

        if (!checkAuth()) {
            return;
        }

        refetch();
    };

    // Handle error
    useEffect(() => {
        if (error) {
            console.log(error);

            if ((error as any).status === 403) {
                setOpen(false);
                notify("Connection to Report Buddy is lost ⛓️‍💥");

                localStorage.removeItem("connection");
                setConnection(false);
            } else if ((error as any).status === 401) {
                notify("You are not authorized to access this page 🚫");
                clearAuth();
            } else {
                notify("Something went wrong, try again later 🤥");
            }
        }
    }, [error]);

    // Clean up
    useEffect(() => {
        return () => {
            queryClient.removeQueries({ queryKey: ["edit-batch"] });
        };
    }, []);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>{children}</DialogTrigger>
            <DialogContent
                onClick={(e) => e.preventDefault()}
                className="w-full flex flex-col gap-10 bg-my-bg border border-zinc-800"
            >
                <DialogHeader>
                    <DialogTitle className="text-white text-base flex items-center gap-3 text-start w-[calc(100%-5%)]">
                        <span>Update batch name.</span>
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground font-medium text-xs text-start">
                        You can change your batch name here.
                    </DialogDescription>
                </DialogHeader>

                {/* Form */}
                <div className="space-y-3">
                    <div className="space-y-2">
                        <Label
                            htmlFor="batchname"
                            className="text-xs text-white font-medium"
                        >
                            Batch Name
                        </Label>
                        <div className="relative flex-1">
                            <Input
                                id="batchname"
                                tabIndex={-1}
                                required
                                autoComplete="off"
                                defaultValue={bname.current}
                                onChange={(e) => (bname.current = e.target.value)}
                                placeholder={`Enter batch name`}
                                className="text-white text-sm font-medium p-5 pl-9 border border-zinc-800 hover:border-zinc-600 bg-black hover:bg-my-bg-light"
                            />
                            <Home className="w-4 h-4 absolute left-3 top-[13px] text-muted-foreground" />
                        </div>

                        {/* Error */}
                        <p
                            ref={errorp}
                            className="relative -top-1 font-medium text-xs text-red-600"
                        ></p>
                    </div>

                    <Button
                        disabled={isLoading}
                        onClick={handleSubmit}
                        className="h-11 w-full text-center cursor-pointer disabled:cursor-not-allowed 
                        shadow-none bg-muted hover:bg-muted dark:bg-muted dark:hover:bg-muted text-foreground"
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Processing...
                            </div>
                        ) : (
                            "Update"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default EditBatchModal;
