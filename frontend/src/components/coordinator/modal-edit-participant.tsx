import { useEffect, useLayoutEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Briefcase, Loader2, Phone, UserRound } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchData } from "@/service/api-service";
import API_END_POINTS from "@/constants/api-endpoints";
import { useAuth } from "@/context/auth-context";
import { useNotification } from "@/context/notification-context";
import { type SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    formSchemaParticipant,
    type FormTypeParticipant,
} from "@/validations/update-participant";
import ValidationError from "../common/validation-error";
// Interface for Props
interface PropsType {
    open: boolean;
    setOpen: (open: boolean) => void;
    data: {
        id: string;
        name: string;
        phoneNumber: string;
        profilePic: string;
        role: string;
    };
}

// Edit participants Modal
function EditParticipantModal({ open, setOpen, data }: PropsType) {
    // Participant role
    const [prole, setProle] = useState<string>("");

    // Query client
    const queryClient = useQueryClient();

    // Auth context
    const { setConnection, checkAuth, clearAuth } = useAuth();

    // Notification context
    const { notify } = useNotification();

    // Hook form
    const {
        register,
        setValue,
        reset,
        handleSubmit,
        formState: { errors },
    } = useForm<FormTypeParticipant>({
        resolver: zodResolver(formSchemaParticipant),
    });

    // On Submit
    const OnSubmit: SubmitHandler<FormTypeParticipant> = async (formData) => {
        if (!checkAuth()) {
            return;
        }

        // Update
        mutate({
            id: data.id,
            name: formData.pname,
            phoneNumber: formData.pnumber,
            role: formData.prole,
        });
    };

    // useMutation for updating participant's details
    const { mutate, isPending, error } = useMutation({
        mutationKey: ["update-participant-details"],
        mutationFn: async (payload: {
            id: string;
            name: string;
            phoneNumber: string;
            role: string;
        }) => {
            // Send request
            const resp = await patchData(API_END_POINTS.PARTICIPANT, payload);

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

    // Reset form
    useLayoutEffect(() => {
        if (open) {
            reset({
                pname: data.name || "",
                pnumber: data.phoneNumber,
                prole: data.role,
            });
        }
    }, [open, data]);

    // Handle errors
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

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="w-full flex flex-col gap-10 bg-my-bg border border-zinc-800">
                <DialogHeader>
                    <DialogTitle className="text-white text-base flex items-center gap-3 text-start w-[calc(100%-5%)]">
                        <span>Update this participant's details.</span>
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground font-medium text-xs text-start">
                        You can change this participant's detials here.
                    </DialogDescription>
                </DialogHeader>

                {/* Form */}
                <form onSubmit={handleSubmit(OnSubmit)} className="space-y-3">
                    {/* Participant's name */}
                    <div className="space-y-2">
                        <Label htmlFor="pname" className="text-xs text-white font-medium">
                            Parcipant's Name
                        </Label>
                        <div className="relative flex-1">
                            <Input
                                id="pname"
                                tabIndex={-1}
                                autoComplete="off"
                                {...register("pname")}
                                placeholder={`Enter participant's name`}
                                className="text-white text-sm font-medium p-5 pl-9 border border-zinc-800 hover:border-zinc-600 bg-black hover:bg-my-bg-light"
                            />
                            <UserRound className="w-4 h-4 absolute left-3 top-[13px] text-muted-foreground" />
                        </div>

                        {/* Error */}
                        <ValidationError error={errors.pname?.message || ""} />
                    </div>

                    {/* Participant's number */}
                    <div className="space-y-2">
                        <Label htmlFor="pnumber" className="text-xs text-white font-medium">
                            Phone Number
                        </Label>
                        <div className="relative flex-1">
                            <Input
                                id="pnumber"
                                tabIndex={-1}
                                autoComplete="off"
                                {...register("pnumber")}
                                placeholder={`Enter phone number`}
                                className="text-white text-sm font-medium p-5 pl-9 border border-zinc-800 hover:border-zinc-600 bg-black hover:bg-my-bg-light"
                            />
                            <Phone className="w-4 h-4 absolute left-3 top-[13px] text-muted-foreground" />
                        </div>

                        {/* Error */}
                        <ValidationError error={errors.pnumber?.message || ""} />
                    </div>

                    {/* Participant's role */}
                    <div className="space-y-2">
                        <Label htmlFor="role" className="text-xs text-white font-medium">
                            Role
                        </Label>
                        <Select
                            value={prole}
                            onValueChange={(value) => {
                                setProle(value);
                                setValue("prole", value);
                            }}
                        >
                            <SelectTrigger
                                {...register("prole")}
                                id="role"
                                className="relative w-full text-white text-sm font-medium p-5 pl-9 
                                border border-zinc-800 hover:border-zinc-600 bg-black hover:bg-my-bg-light cursor-pointer"
                            >
                                <SelectValue placeholder="Select a role" />
                                <Briefcase className="w-4 h-4 absolute left-3 top-[13px] text-muted-foreground" />
                            </SelectTrigger>
                            <SelectContent className="bg-my-bg-light border border-zinc-800 text-white">
                                <SelectItem value="Student">Student</SelectItem>
                                <SelectItem value="Trainer">Trainer</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Error */}
                        <ValidationError
                            error={(errors.prole?.message && "Role is required") || ""}
                        />
                    </div>

                    {/* Submit button */}
                    <Button
                        type="submit"
                        disabled={isPending}
                        className="h-11 w-full text-center cursor-pointer disabled:cursor-not-allowed 
                        shadow-none bg-muted hover:bg-muted dark:bg-muted dark:hover:bg-muted text-foreground"
                    >
                        {isPending ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Processing...
                            </div>
                        ) : (
                            "Update"
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default EditParticipantModal;
