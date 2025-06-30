import { useEffect, useState, type ReactNode } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { useNotification } from "@/context/notification-context";
import { useAuth } from "@/context/auth-context";
import { useMutation } from "@tanstack/react-query";
import { deleteData } from "@/service/api-service";
import API_END_POINTS from "@/constants/api-endpoints";
import { useParams } from "react-router-dom";
import { errorHandler } from "@/utils/error-handler";
import { Loader2 } from "lucide-react";

// Interface for Props
interface PropsType {
    children: ReactNode;
}

// Confirm modal Component
function ConfirmModal({ children }: PropsType) {
    // Params
    const params = useParams();
    const phoneNumber = params.phoneNumber;
    const groupId = params.groupId;

    // Modal state
    const [open, setOpen] = useState<boolean>(false);

    // Notification context
    const { notify } = useNotification();

    // Auth context
    const { setConnection, checkAuth, clearAuth } = useAuth();

    // Handle disconnect
    const handleDisconnect = () => {
        if (!checkAuth()) {
            return;
        }

        mutate();
    };

    // useMutation to enable/disable tracking and sharing
    const { mutate, isPending, error } = useMutation({
        mutationKey: ["enable-disable"],
        mutationFn: async () => {
            // Send request
            const resp = await deleteData(
                API_END_POINTS.BATCH +
                `?groupId=${groupId}&coordinatorId=${phoneNumber}`
            );

            // Success response
            if (resp && resp.status === 200) {
                return resp.data?.data;
            }
        },
        onSuccess: () => {
            clearAuth();
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
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent
                onClick={(e) => e.preventDefault()}
                className="w-full flex flex-col gap-10 bg-my-bg border border-zinc-800"
            >
                <DialogHeader>
                    <DialogTitle className="text-white text-base flex items-center gap-3 text-start w-[calc(100%-5%)]">
                        <span>Are you sure you want to logout?</span>
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground font-medium text-xs text-start">
                        This action cannot be undone. You have to re-scan to connect again.
                    </DialogDescription>
                </DialogHeader>

                {/* Action buttons */}
                <div className="w-full flex items-center justify-end gap-2">
                    <Button
                        onClick={() => setOpen(false)}
                        type="button"
                        className="h-11 w-full text-center cursor-pointer disabled:cursor-not-allowed                         
                        shadow-none bg-white hover:bg-muted dark:bg-muted dark:hover:bg-muted text-foreground"
                    >
                        Cancel
                    </Button>
                    <Button
                        disabled={isPending}
                        onClick={handleDisconnect}
                        className="h-11 w-full text-center cursor-pointer disabled:cursor-not-allowed 
                        shadow-none bg-white hover:bg-muted dark:bg-muted dark:hover:bg-muted text-foreground"
                    >
                        {isPending ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Processing
                            </div>
                        ) : (
                            "Yes"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default ConfirmModal;
