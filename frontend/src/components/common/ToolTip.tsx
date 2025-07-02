import type { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Interface for Props
interface PropsType {
    children: ReactNode;
    text: string;
    className?: string;
}

// Tooltip
export function ToolTip({ children, text, className }: PropsType) {
    return (
        <Tooltip >
            <TooltipTrigger className={cn(className)}>{children}</TooltipTrigger>
            <TooltipContent side="right" className="bg-my-bg-dark">
                <p className="text-sm font-medium tracking-wide">{text}</p>
            </TooltipContent>
        </Tooltip>
    );
}
