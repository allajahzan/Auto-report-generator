import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import { Loader2, UsersRound } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";

// Inteface for Props
interface PropsType {
    open: boolean;
    setOpen: (open: boolean) => void;
    groups: { id: string; name: string }[];
}

// Select group modal Component
function SelectGroupModal({ open, setOpen, groups }: PropsType) {
    // Form state
    const [submiting, setSubmiting] = useState<boolean>(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent
                onClick={(e) => e.preventDefault()}
                className="flex flex-col gap-10 bg-my-bg-light border border-zinc-800"
            >
                <DialogHeader>
                    <DialogTitle className="text-white text-base flex items-center gap-3">
                        <div className="p-2 bg-zinc-800 rounded-full">
                            <UsersRound className="w-4 h-4" />
                        </div>
                        <span>Select group you wanna connect to report buddy?</span>
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground font-medium">
                        The selected group will be connected to report buddy.
                    </DialogDescription>
                </DialogHeader>

                {/* Groups lists */}
                <div className="flex flex-col gap-3 text-white font-medium">
                    {groups.length > 0 &&
                        groups.map((grp) => {
                            return <div>{grp.name}</div>;
                        })}
                    {groups.length === 0 && (
                        <p className="">No groups are there in your WhatsApp</p>
                    )}
                </div>

                <div className="flex justify-end gap-2">
                    <Button
                        disabled={submiting}
                        className="h-11 w-full text-center cursor-pointer disabled:cursor-not-allowed 
                        shadow-none bg-muted hover:bg-muted dark:bg-muted dark:hover:bg-muted text-foreground"
                    >
                        {submiting ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Processing...
                            </div>
                        ) : (
                            "Select group"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default SelectGroupModal;
