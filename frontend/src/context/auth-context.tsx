import { refreshSocket } from "@/socket/io";
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
    const [connection, setConnection] = useState<boolean>(() => {
        const isConnected = localStorage.getItem("connection") === "1";
        const hasPhoneNumber = !!localStorage.getItem("phoneNumber");
        const hasGroupId = !!localStorage.getItem("groupId");

        return isConnected && hasPhoneNumber && hasGroupId;
    });

    const [phoneNumber, setPhoneNumber] = useState<string>(
        localStorage.getItem("phoneNumber") || ""
    );

    const [groupId, setGroupId] = useState<string>(
        localStorage.getItem("groupId") || ""
    );

    // Emit event to refresh socket
    useEffect(() => {
        const phoneNumber = localStorage.getItem("phoneNumber");

        if (phoneNumber) {
            refreshSocket(phoneNumber);
        }
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
