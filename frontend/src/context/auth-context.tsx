import { refreshSocket } from "@/socket/bot";
import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";

// Interface for Auth context
export interface IAuthContext {
    connection: boolean;
    setConnection: (connection: boolean) => void;
    phoneNumber: string;
    setPhoneNumber: (phoneNumber: string) => void;
    groupId: string;
    setGroupId: (groupId: string) => void;
}

const AuthContext = createContext<IAuthContext | null>(null);

// Custom hook
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthContextProvider");
    }
    return context;
};

// Auth context provider
export function AuthContextProvider({ children }: { children: ReactNode }) {
    const [connection, setConnection] = useState<boolean>(
        localStorage.getItem("connection") === "1"
    );

    const [phoneNumber, setPhoneNumber] = useState<string>(
        localStorage.getItem("phoneNumber") || ""
    );

    const [groupId, setGroupId] = useState<string>(
        localStorage.getItem("groupId") || ""
    );

    // Emit an event refresh socket when page reload
    useEffect(() => {
        const handleLoad = () => {
            const navType = performance.getEntriesByType(
                "navigation"
            )[0] as PerformanceNavigationTiming;

            if (navType?.type === "reload") {
                if (phoneNumber) {
                    refreshSocket(phoneNumber);
                }
            }
        };

        window.addEventListener("load", handleLoad);

        return () => {
            window.removeEventListener("load", handleLoad);
        };
    }, []);

    return (
        <AuthContext.Provider
            value={{
                connection,
                setConnection,
                phoneNumber,
                setPhoneNumber,
                groupId,
                setGroupId,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
