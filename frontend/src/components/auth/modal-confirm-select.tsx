import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { postData } from "@/service/api-service";
import API_END_POINTS from "@/constants/api-endpoints";
import type { IGroup, IParticipant } from "./modal-select-group";
import { useAuth } from "@/context/auth-context";
import { useEffect } from "react";
import { errorHandler } from "@/utils/error-handler";
import { useNotification } from "@/context/notification-context";

// Interface for Props
interface PropsType {
    open: boolean;
    setOpen: (open: boolean) => void;
    selectedGroup: IGroup | null;
    batchName: string;
    participants: IParticipant[];
}

// Confirm select modal
function ConfirmSelectModal({
    open,
    setOpen,
    selectedGroup,
    batchName,
    participants,
}: PropsType) {
    // Auth context
    const { phoneNumber, setPhoneNumber, setConnection, setGroupId, clearAuth } =
        useAuth();

    // Notification context
    const { notify } = useNotification();

    // Handle select
    const handleSelect = () => {
        mutate({
            batchName,
            participants: participants.map((p) => {
                return {
                    id: p.id,
                    name: p.name,
                    phoneNumber: p.phoneNumber,
                    role: p.role,
                };
            }),
        });
    };

    // useMutation to select group
    const { mutate, isPending, error } = useMutation({
        mutationKey: ["group-select"],
        mutationFn: async (payload: {
            batchName: string;
            participants: Partial<IParticipant>[];
        }) => {
            // Send request
            const resp = await postData(
                API_END_POINTS.GROUP +
                `?groupId=${selectedGroup?.id}&coordinatorId=${phoneNumber}`,
                payload
            );

            // Success response
            if (resp && resp.status === 200) {
                return resp.data?.data;
            }
        },
        onSuccess: () => {
            localStorage.setItem("phoneNumber", phoneNumber);
            setPhoneNumber(phoneNumber);
            localStorage.setItem("connection", "1");
            setConnection(true);
            localStorage.setItem("groupId", selectedGroup?.id || "");
            setGroupId(selectedGroup?.id || "");

            notify("Successfully selected the WhatsApp group 👏");
            setOpen(false);
        },
        onError: (error) => {
            console.log(error);
        },
    });

    // Handle error
    useEffect(() => {
        if (error) {
            errorHandler(error, notify, setConnection, clearAuth);
        }
    }, [error]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent
                onClick={(e) => e.preventDefault()}
                className="w-full flex flex-col gap-10 bg-my-bg border border-zinc-800"
            >
                <DialogHeader>
                    <DialogTitle className="text-white text-base flex items-center gap-3 text-start w-[calc(100%-5%)]">
                        <span>Are you sure you want to select this WhatsApp group?</span>
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground font-medium text-xs text-start w-[calc(100%-5%)]">
                        This action cannot be undone. You have to logout to select a new
                        group
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
                        onClick={handleSelect}
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

export default ConfirmSelectModal;
