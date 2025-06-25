import { sonnerStyle } from "@/constants/sonner-style";
import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import { useMediaQuery } from "react-responsive";
import { toast } from "sonner";

// Interface for INotification
interface INotification {
    id: string;
    message: string;
}

// Interface for Notification context
export interface INotificationContext {
    notify: (msg: string) => void;
}

const NotificationContext = createContext<INotificationContext | null>(null);

// Custom hook
export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthContextProvider");
    }
    return context;
};

// Notification context provider
function NotificationContextProvider({ children }: { children: ReactNode }) {
    const isMobile = useMediaQuery({ query: "(max-width: 620px)" });

    const [notification, setNotification] = useState<INotification | null>(null);

    const notify = (msg: string) =>
        setNotification({ id: Date.now().toString(), message: msg });

    // Show notfication
    useEffect(() => {
        if (notification) {
            toast(notification.message, {
                position: "top-right",
                style: { ...sonnerStyle, ...(!isMobile && { width: "max-content" }) },
            });
        }
    }, [notification?.id]);

    return (
        <NotificationContext.Provider value={{ notify }}>
            {children}
        </NotificationContext.Provider>
    );
}

export default NotificationContextProvider;
