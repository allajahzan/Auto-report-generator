import type { IBatch } from "@/types/batch";
import { Activity, FileClock, Settings2, Trash } from "lucide-react";
import { Switch } from "../ui/switch";
import { useState } from "react";
import { Button } from "../ui/button";

// Interface for props
interface PropsType {
    data: IBatch;
}

// Settings Component
function Settings({ data }: PropsType) {
    // Toggle button states
    const [enableTracking, setEnableTracking] = useState<boolean>(
        data?.isTrackingEnabled ?? false
    );

    const [enableSharing, setEnableSharing] = useState<boolean>(
        data?.isSharingEnabled ?? false
    );

    // Handle toggle button
    const handleToggleButton = async (type: "tracking" | "sharing") => {
        if (type === "tracking") {
            const newState = !enableTracking;
            setEnableTracking(newState);
        } else if (type === "sharing") {
            const newState = !enableSharing;
            setEnableSharing(newState);
        }
    };

    return (
        <div className="relative w-full h-fit p-5 flex flex-col gap-5 bg-my-bg-light rounded-2xl shadow">
            {/* Title */}
            <div className="flex justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-zinc-800 text-white cursor-pointer">
                        <Settings2 className="w-4 h-4" />
                    </div>
                    <h1 className="text-lg font-extrabold text-white tracking-wide">
                        Settings
                    </h1>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                {/* Enable tracking */}
                <div className="p-3 flex items-center gap-3 bg-my-bg-dark rounded-lg shadow">
                    <div className="p-3.5 rounded-sm bg-zinc-800 text-white">
                        <Activity className="w-5 h-5" />
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                        <h1 className="font-semibold text-sm text-white">
                            WhatsApp Group Tracking
                        </h1>
                        <p className="font-medium text-xs text-muted-foreground">
                            Track the selected WhatsApp group for audio task submissions.
                        </p>
                    </div>
                    <Switch
                        id="enable-tracking"
                        className="relative right-2"
                        checked={enableTracking}
                        onCheckedChange={() => handleToggleButton("tracking")}
                    />
                </div>

                {/* Enable schedule */}
                <div className="p-3 flex items-center gap-3 bg-my-bg-dark rounded-lg shadow">
                    <div className="p-3.5 rounded-sm bg-zinc-800 text-white">
                        <FileClock className="w-5 h-5" />
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                        <h1 className="font-semibold text-sm text-white">
                            Audio Task Report Sharing
                        </h1>
                        <p className="font-medium text-xs text-muted-foreground">
                            Automatically share audio task reports at scheduled times.
                        </p>
                    </div>
                    <Switch
                        id="enable-sharing"
                        className="relative right-2"
                        checked={enableSharing}
                        onCheckedChange={() => handleToggleButton("sharing")}
                    />
                </div>

                {/* Disconnect & Delete account */}
                <div className="p-3 flex items-center gap-3 bg-my-bg-dark rounded-lg shadow">
                    <div className="p-3.5 rounded-sm bg-red-600/20 text-red-600">
                        <Trash className="w-5 h-5" />
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                        <h1 className="font-semibold text-sm text-white">
                            Disconnect & Delete Account
                        </h1>
                        <p className="font-medium text-xs text-muted-foreground">
                            Disconnect from Report Buddy and delete your account, along with
                            all the reports
                        </p>
                    </div>
                    <Button className="border border-red-600 text-red-600 hover:bg-red-600/20 cursor-pointer">
                        Delete
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default Settings;
